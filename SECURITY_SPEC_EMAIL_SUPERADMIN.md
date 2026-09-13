# Security Spec: Email Recovery & Superadmin Emergency Access

## 1. Email Recovery (Forgot Password Flow)

### Requirements
- User requests reset via email (input email di `/admin/forgot-password`)
- Generate secure token (crypto.randomBytes 32 bytes, base64url)
- Token expires 1 jam, single-use
- Kirim email via nodemailer (SMTP) — fallback log ke console kalau SMTP gagal
- Link reset: `/admin/reset-password?token=xxx` → form set password baru
- Token hash simpan di DB (bcrypt), bukan plaintext
- Rate limit: max 1 request per email per 15 menit
- Log audit: `{email, ip, timestamp, tokenHash, success}`

### API Endpoints
- `POST /api/admin/forgot-password` — `{email}` → kirim email
- `GET /admin/reset-password?token=xxx` — validasi token, tampilkan form
- `POST /api/admin/reset-password` — `{token, password, confirmPassword}` → hash baru, hapus token, invalidate sessions

### Email Template
```
Subject: Reset Password MASHUDI Admin
Body:
Halo,
Kamu (atau orang lain) minta reset password admin MASHUDI.
Link reset (berlaku 1 jam, 1x pakai):
https://mashudirentalpekanbaru.biz.id/admin/reset-password?token=xxx

Kalau bukan kamu, abaikan email ini.
```

---

## 2. Superadmin Emergency Access

### Concept
- 1 akun `superadmin` yang **tidak bisa di-lockout**, **tidak kena rate limit**, **bypass 2FA**
- Akses via env `SUPER_ADMIN_EMAIL` + `SUPER_ADMIN_PASSWORD` (hash bcrypt)
- Bisa dipakai buat unlock akun lain, reset 2FA, dll
- Login pakai endpoint terpisah: `POST /api/admin/super-login` (bukan `/api/admin/login`)
- Audit log wajib: `{action: "superadmin_login", email, ip, timestamp, userAgent}`

### Implementasi
- Middleware `isSuperAdmin(req)` cek email dari session/cookie vs env
- Route `/api/admin/super-login` bypass rate limit, lockout, 2FA
- Superadmin bisa akses `/admin/unlock?email=xxx` → unlock akun user
- Superadmin bisa reset 2FA user: `POST /api/admin/reset-2fa` `{email}`

### Env Required
```
SUPER_ADMIN_EMAIL=superadmin@mashudi.local
SUPER_ADMIN_PASSWORD_HASH=$2b$12$...
```

---

## Implementation Files

### New Files
- `lib/email.ts` — nodemailer config + sendResetEmail()
- `lib/recovery.ts` — generateToken, hashToken, verifyToken, storeToken, consumeToken
- `app/api/admin/forgot-password/route.ts`
- `app/api/admin/reset-password/route.ts` (GET + POST)
- `app/api/admin/super-login/route.ts`
- `app/api/admin/unlock/route.ts` (POST)
- `app/api/admin/reset-2fa/route.ts` (POST)
- `app/admin/forgot-password/page.tsx`
- `app/admin/reset-password/page.tsx`
- `app/admin/super-login/page.tsx`

### Modified Files
- `lib/auth.ts` — add isSuperAdmin(), verifySuperAdmin()
- `lib/ratelimit.ts` — add forgotPasswordLimiter, superAdminBypass
- `middleware.ts` — skip rate limit for superadmin routes
- `prisma/schema.prisma` — add `PasswordResetToken` model, `User.isSuperAdmin` flag
- `.env.example` — add SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD_HASH, SMTP_*

---

## Database Schema Additions

```prisma
model PasswordResetToken {
  id        String   @id @default(cuid())
  email     String
  tokenHash String
  expiresAt DateTime
  used      Boolean  @default(false)
  createdAt DateTime @default(now())
  @@index([email])
  @@index([tokenHash])
}

model User {
  // existing fields...
  isSuperAdmin Boolean @default(false)
  passwordResetTokens PasswordResetToken[]
}
```

---

## Acceptance Criteria

### Email Recovery
- [ ] User input email → terima email reset (cek console/log)
- [ ] Link token valid 1 jam, 1x pakai → bisa set password baru
- [ ] Password baru hash bcrypt cost 12, session lama invalid
- [ ] Rate limit 1 req/email/15min kerja
- [ ] Token hash di DB, gak plaintext

### Superadmin
- [ ] Login via `/api/admin/super-login` bypass rate limit & lockout
- [ ] Superadmin session ada flag `isSuperAdmin: true`
- [ ] Bisa unlock user lain via `/api/admin/unlock` `{email}`
- [ ] Bisa reset 2FA user via `/api/admin/reset-2fa`
- [ ] Audit log semua aksi superadmin

---

## Next Steps
1. Kamu approve spec ini → Hana implement Phase 1: DB schema + lib/email + lib/recovery
2. Phase 2: API routes + pages
3. Phase 3: Superadmin routes + middleware bypass
4. Test lokal → commit lokal → kamu review → nanti push kalau ok