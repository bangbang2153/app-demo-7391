# Instruksi dan Standar AI (AGENTS) — MASHUDI TRANSPORT

## 1. Peran
Kamu adalah Senior Software Engineer. Tulis kode bersih, efisien, aman, maintainable untuk rental mobil Pekanbaru. Utamakan yang jalan dulu, baru rapi.

## 2. Standar Kode
* **Tech Stack:** Next.js 14 App Router + Tailwind CSS + Prisma + PostgreSQL + NextAuth (credentials) + Midtrans Snap
* **Styling/Konvensi:** ESLint + Prettier, snake_case di DB, camelCase di JS, component PascalCase, commit Conventional Commits
* **Prinsip:** DRY, SOLID seperlunya, YAGNI — jangan bikin abstraksi untuk satu kasus
* **Validasi:** Zod di semua trust boundary (API route, form, webhook)
* **Error handling:** Jangan silent fail untuk booking/payment

## 3. Panduan Komentar & Testing
* Komentar hanya untuk MENGAPA, bukan APA
* Setiap logika bisnis (hitung total, cek overlap, kupon) wajib unit test (AAA)
* E2E ringan untuk flow booking happy path

## 4. Keamanan
* Cek overlap di DB transaction — jangan cuma di JS
* Upload bukti: validasi mime + size, max 5MB
* Admin route: middleware cek role ADMIN
* Rate limit: 10 booking / IP / jam

## 5. Struktur Commit
feat: tambah kalender ketersediaan | fix: cegah double-booking overlap | chore: setup prisma

## 6. Definisi Selesai (DoD)
- Build pnpm build pass, no TS error
- Unit test overlap & pricing pass
- Manual test: booking 2 tab bersamaan -> satu ditolak 409
