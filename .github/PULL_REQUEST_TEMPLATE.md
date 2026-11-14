## 📌 Deskripsi Perubahan

<!-- Jelaskan secara ringkas tujuan PR dan masalah yang diselesaikan -->

## 🎯 Issue / Ticket Reference

- Fixes #
- Ref:

## 🛡️ Klasifikasi Risiko (Risk Level)

- [ ] L1 (Perubahan minor / teks / tampilan non-kritis)
- [ ] L2 (Penambahan fitur bisnis, perubahan skema DB, atau endpoint baru)
- [ ] L3 (Perubahan logika autentikasi, enkripsi, hak akses inti, atau migrasi data destruktif)

## 🧪 Bukti Pengujian (Test Evidence)

- [ ] `pnpm check` (format check, linting, typecheck, dan unit test lolos tanpa error)
- [ ] Migrasi database berhasil diuji secara lokal (`pnpm db:push` / `pnpm db:migrate`)
- [ ] Manual test flow untuk fitur baru telah diverifikasi

<!-- Lampirkan screenshot jika ada perubahan UI -->

## 🔒 Security & Privacy Review

- [ ] Tidak ada kredensial, token API, atau private key yang ter-commit (.env aman)
- [ ] Hak akses diverifikasi di sisi server (Server Actions / API), bukan hanya UI
- [ ] Input eksternal telah divalidasi dengan Zod

## 🔄 Rencana Rollback / Forward-Fix

<!-- Jelaskan langkah mitigasi jika terjadi kegagalan setelah deploy -->
