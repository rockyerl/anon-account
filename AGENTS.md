# AI CODING AGENT GUIDELINES (SUNDAWA AI-01 s/d AI-08)

Repositori ini mengikuti **SUNDAWA Code Setup Standards**. Setiap AI Assistant / Coding Agent yang beroperasi di repositori ini WAJIB mematuhi ketentuan berikut:

1. **Boundary & Arsitektur (AI-01, AI-02):**
   - Hormati arsitektur Feature-Driven modular: Routing (`src/app`), Features/Vertical Slices (`src/features/*`), Shared UI Primitives (`src/shared`), dan Persistence (`src/db`).
   - Jangan melakukan refactoring spekulatif pada berkas yang tidak diminta oleh pengguna.
   - Periksa schema database (`src/db/schema.ts`) dan tipe data sebelum menambahkan fitur baru.

2. **Kerahasiaan & Data Pribadi (AI-03):**
   - JANGAN PERNAH menyisipkan kredensial asli, token API rahasia, atau data nasabah/pengguna nyata ke dalam kode, prompt, atau fixtures tes.
   - Selalu gunakan data dummy representatif pada seeder dan pengujian.

3. **Integritas Keamanan & Otorisasi (SEC-07, BE-03):**
   - JANGAN PERNAH mengandalkan proteksi sisi klien (UI semata). Setiap mutasi (Server Action) dan pembacaan data WAJIB memeriksa sesi dan hak akses (`requireAuth` / `requirePermission`).
   - Password WAJIB di-hash menggunakan fungsi `hashPassword` (`bcryptjs`). Dilarang menyimpan plaintext.

4. **Kualitas Kode & Verifikasi Wajib (AI-04, Universal Command):**
   - Sebelum menyelesaikan tugas, selalu jalankan dan pastikan lolos:
     ```bash
     pnpm check
     ```
     (Menjalankan `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, dan `pnpm test`).
   - Jangan menekan atau mengabaikan peringatan linter (`// eslint-disable`) tanpa justifikasi teknis yang disetujui.

5. **Disiplin Basis Data (AI-05):**
   - Dilarang menjalankan migrasi destruktif (`drop table/column`) tanpa konfirmasi eksplisit dari Tech Lead.
   - Skema database harus terdefinisi di `src/db/schema.ts` dan disinkronkan melalui Drizzle Kit (`pnpm db:push` / `pnpm db:generate`).
