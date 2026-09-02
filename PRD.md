# Product Requirements Document (PRD) — MASHUDI TRANSPORT

## 1. Ringkasan Proyek (Overview)
**Nama Proyek:** MASHUDI TRANSPORT
**Lokasi:** Pekanbaru, Riau
**Visi:** Jadi rental mobil paling gampang di Pekanbaru — cek mobil, cek tanggal, booking, bayar DP/full, beres.
**Tagline:** Sewa Mobil Pekanbaru — Harian, Lepas Kunci & Dengan Supir
**Durasi:** Harian (nego via WA untuk kasus khusus/jam/bulanan)

## 2. Masalah & Solusi
**Masalah:**
- Calon penyewa susah cek ketersediaan realtime, harus chat WA tanya satu-satu
- Katalog tidak transparan (foto, harga, fasilitas, syarat sewa tidak jelas)
- Admin kelola booking manual (WA/Excel), rawan double-booking
- Korporat butuh invoice & histori, pengguna umum butuh ulasan

**Solusi:**
- Web katalog + kalender ketersediaan realtime + booking online + pembayaran DP/full (transfer/QRIS) + tombol Nego WA
- Admin panel CRUD mobil, approve booking, verifikasi pembayaran, laporan
- Cegah double-booking di level DB + aplikasi

## 3. Target Pengguna
- **Umum (B2C):** Keluarga, mahasiswa, wisatawan — Avanza, Xenia, Innova, Hiace harian lepas kunci
- **Korporat (B2B):** Perusahaan/instansi dengan supir + invoice
- **Travel/Agen:** Butuh armada banyak, cek stok cepat
- **Admin/Owner:** Kelola armada, harga, booking, pembayaran

## 4. Minimum Viable Product (MVP) / Fitur Inti
### 4.1 Katalog & Pencarian
- [ ] Grid katalog: foto, nama, transmisi, kapasitas, harga/hari, badge Tersedia/Disewa
- [ ] Filter: transmisi (MT/AT), kapasitas (5/7/15), harga range, kategori (MPV/SUV/Hiace)
- [ ] Sorting: termurah/termahal, terbaru
- [ ] Detail mobil: galeri 3-6 foto, spesifikasi, fasilitas, syarat sewa, harga harian/mingguan/bulanan, kalender ketersediaan

### 4.2 Ketersediaan Realtime
- [ ] Kalender blokir tanggal yang sudah di-booking (status paid/confirmed/dp_paid)
- [ ] Validasi overlap di backend + constraint DB
- [ ] Estimasi total = harga_harian x jumlah_hari + biaya supir (jika dengan supir)

### 4.3 Booking
- [ ] Pilih mobil -> tanggal sewa & kembali (min 1 hari) -> mode Lepas Kunci / Dengan Supir -> lokasi antar/jemput -> data penyewa -> ringkasan biaya
- [ ] Tombol "Nego via WA" di setiap step (prefill: "Halo Mashudi Transport, mau sewa [Mobil] tgl [X]-[Y]...")
- [ ] Guest booking (tanpa login) + login opsional

### 4.4 Pembayaran
- [ ] Opsi: DP 30% / Full. Metode: Transfer Manual (BCA/BRI/Mandiri) + QRIS (Midtrans/Xendit)
- [ ] Upload bukti transfer -> admin verifikasi -> Paid
- [ ] Midtrans Snap untuk auto-confirm (MVP: manual + QRIS)

### 4.5 Auth & Akun
- [ ] Register/Login email+password, role USER/ADMIN
- [ ] Halaman "Pesanan Saya" (riwayat + status + invoice PDF sederhana)

### 4.6 Admin Panel
- [ ] Dashboard: booking hari ini, pendapatan, mobil terlaris
- [ ] CRUD Armada: tambah/edit/hapus mobil, upload foto, set harga, qty unit per tipe
- [ ] Kelola Booking: list, filter status (pending/paid/confirmed/completed/cancelled), approve/reject, verifikasi pembayaran
- [ ] Kelola User, Ulasan, Promo

### 4.7 Ulasan & Promo
- [ ] Rating bintang + komentar per mobil (hanya yang completed)
- [ ] Kupon promo (kode, %/nominal, periode)

## 5. Di Luar Cakupan (Out of Scope) MVP
- Multi-cabang & mutasi armada antar kota
- GPS live tracking, asuransi integrasi
- Aplikasi mobile native (cukup web responsive)
- Loyalty point / membership tier

## 6. Alur Utama (User Journey)
1. Buka katalog -> filter -> detail -> lihat kalender -> Booking / Nego WA
2. Isi tanggal + mode + data diri -> lihat total -> pilih DP/Full -> bayar (transfer/QRIS) atau lanjut WA
3. Admin verifikasi -> confirm -> user dapat WA konfirmasi + invoice
4. Selesai sewa -> beri ulasan

## 7. Kebutuhan Non-Fungsional
- Responsive mobile-first, Lighthouse >90
- SEO: /mobil/[slug], schema.org/Car, meta Pekanbaru
- Keamanan: validasi overlap, rate limit, upload max 5MB
- Notifikasi: WA (Fonnte/Wablas) + email

## 8. Metrik Sukses
- <2 menit dari katalog ke submit booking
- 0 double-booking
- 70% booking via web dalam 3 bulan
