# Aturan Main & Alur Kerja AI (WORKFLOW) — MASHUDI TRANSPORT

## 1. Mode Operasional
* **Ask First:** Untuk perubahan harga, skema DB breaking, ganti payment gateway
* **Auto:** Untuk CRUD katalog, UI tweak, bugfix overlap — langsung eksekusi + update TODO.md

## 2. Standar Operasional Prosedur (SOP) AI
1. **Pahami:** Baca PRD.md dan ARCHITECTURE.md — jangan asumsi durasi/nego
2. **Rencanakan:** Step-by-step, sebut file & API yang disentuh
3. **Eksekusi:** Tulis kode sesuai AGENTS.md (Zod, overlap check, test)
4. **Dokumentasi:** Update TODO.md + commit Conventional Commits

## 3. Wajib Bertanya Jika:
* Butuh install dependensi baru di luar arsitektur (mis. ganti Midtrans ke Xendit)
* Ada perubahan skema database yang butuh migrasi & bisa rusak booking lama
* Stuck error loop >3x (lapor + minta log)
* Butuh kredensial Midtrans / WA / DB prod

## 4. Dev Tunnel
* Dev di code.styna.my.id via cloudflared tunnel ed63a7e1-643f-48d0-951b-0370d2ce1b07 (token CF di memory). Jangan pakai trycloudflare.
