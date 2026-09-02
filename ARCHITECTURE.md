# Rencana Arsitektur & Implementasi — MASHUDI TRANSPORT

## 1. Tech Stack
* **Frontend:** Next.js 14 App Router, Tailwind CSS, shadcn/ui, React Hook Form + Zod
* **Backend:** Next.js Route Handlers (/api), Prisma ORM
* **Database:** PostgreSQL (Neon/Supabase/Railway) — single DB MVP
* **Auth:** NextAuth.js (Credentials, + WA OTP opsional nanti)
* **Payment:** Midtrans Snap (QRIS, VA, e-wallet) + manual transfer fallback
* **Storage:** Supabase Storage / Cloudinary / lokal public/uploads (MVP lokal OK)
* **Notifikasi:** Fonnte/Wablas WA + Nodemailer
* **Hosting:** Vercel + PostgreSQL managed, tunnel CF code.styna.my.id untuk dev

## 2. Struktur Folder Utama
```
mashudi-transport/
  app/
    (public)/{page.tsx, mobil/[slug]/page.tsx, booking/page.tsx}
    (admin)/admin/{page.tsx, mobil/page.tsx, booking/page.tsx}
    api/{auth, mobil, bookings, payments, upload}/route.ts
    layout.tsx
  components/{ui, catalog, booking, admin}
  lib/{prisma.ts, auth.ts, pricing.ts, availability.ts, midtrans.ts, wa.ts}
  prisma/{schema.prisma, seed.ts}
  public/{uploads, images}
  tests/{availability.test.ts, pricing.test.ts}
```

## 3. Model Data (Prisma — ringkas)
```prisma
model Car {
  id              String   @id @default(cuid())
  slug            String   @unique
  name            String
  category        String   // MPV / SUV / HIACE
  transmission    String   // MT / AT
  seats           Int
  pricePerDay     Int      // 350000
  driverFeePerDay Int      @default(150000)
  qty             Int      @default(1)
  images          String[]
  features        String[]
  status          String   @default("active")
  bookings        Booking[]
}

model Booking {
  id        String   @id @default(cuid())
  carId     String
  car       Car      @relation(fields: [carId], references: [id])
  userId    String?
  name      String
  wa        String
  email     String?
  startDate DateTime
  endDate   DateTime
  mode      String   // LEPAS_KUNCI / DENGAN_SUPIR
  total     Int
  dpAmount  Int?
  payMethod String?  // TRANSFER / QRIS / MIDTRANS
  payStatus String   @default("pending")
  status    String   @default("pending") // pending/confirmed/completed/cancelled
  proofUrl  String?
  couponCode String?
  createdAt DateTime @default(now())
  @@index([carId, startDate, endDate])
}

model Coupon { code String @id; percent Int?; amount Int?; active Boolean @default(true); validUntil DateTime? }
model Review { id String @id @default(cuid()); carId String; userId String?; rating Int; comment String; createdAt DateTime @default(now()) }
model User   { id String @id @default(cuid()); name String; email String @unique; wa String?; password String?; role String @default("USER") }
```

Cegah double-booking: cek overlap via query WHERE carId AND NOT (endDate <= newStart OR startDate >= newEnd) AND status IN (paid,confirmed,dp_paid) + transaksi.

## 4. Fase Implementasi
### Fase 1: Setup (1-2 hari)
- [ ] pnpm create next-app + tailwind + shadcn + prisma init + seed 8 mobil Pekanbaru
- [ ] Deploy kosong ke Vercel + DB connect
- **DoD:** / render, prisma db push ok, seed jalan

### Fase 2: Katalog & Detail (2-3 hari)
- [ ] Katalog + filter + detail + kalender read-only
- [ ] API GET /api/mobil + GET /api/mobil/[slug]
- **DoD:** Filter & kalender blokir tanggal booked benar

### Fase 3: Booking & Anti Double-Booking (3 hari)
- [ ] Form booking + POST /api/bookings (Zod + cek overlap + hitung total)
- [ ] Tombol Nego WA (wa.me/628xxx?text=...)
- [ ] Unit test availability.ts + pricing.ts
- **DoD:** 2 request overlap bersamaan -> 1 gagal 409

### Fase 4: Payment & Admin (3 hari)
- [ ] Manual transfer upload + Midtrans Snap + webhook /api/payments/callback
- [ ] Admin panel CRUD mobil + verifikasi booking + WA notif
- **DoD:** DP paid -> admin verify -> confirmed, Midtrans auto-confirm

### Fase 5: Ulasan, Promo, Polish (2 hari)
- [ ] Review + kupon + SEO + invoice PDF
- **DoD:** Lighthouse >90, schema.org Car terpasang
