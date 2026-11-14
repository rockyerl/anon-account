# ADR-001: Pilihan Arsitektur Stack, Autentikasi, dan Dynamic RBAC

- **Status:** Accepted
- **Tanggal:** 13 November 2026
- **Pengambil Keputusan:** Engineering Lead, SUNDAWA

---

## 1. Konteks

Setiap kali memulai proyek fullstack baru di SUNDAWA, tim engineering sering kali menghabiskan waktu 1–2 minggu hanya untuk setup boilerplate: autentikasi, manajemen pengguna, role & permission, tata letak dashboard, koneksi database, dan linting/testing.

Kebutuhan utama yang ditetapkan adalah:

1. Template fullstack berbasis Next.js App Router.
2. Mekanisme autentikasi mandiri yang aman dan transparan tanpa vendor lock-in.
3. CRUD Pengguna dan CRUD Role dengan matriks izin menu yang dinamis mengendalikan sidebar.
4. Kepatuhan menyeluruh terhadap SUNDAWA Engineering Standards & Code Setup Standards.

---

## 2. Keputusan yang Diambil

### A. Next.js App Router (Fullstack)

- **Keputusan:** Menggunakan Next.js App Router dengan Server Components dan Server Actions.
- **Rasional:** Menyatukan frontend dan backend dalam satu ekosistem TypeScript tipe-aman, menghilangkan kebutuhan memelihara repositori API terpisah untuk aplikasi level L1 dan L2, serta mengeliminasi latency round-trip berlebih.

### B. Drizzle ORM + LibSQL

- **Keputusan:** Mengadopsi Drizzle ORM dengan driver `@libsql/client`.
- **Rasional:**
  - Menghilangkan kompilasi biner C++ native yang kerap bermasalah di lingkungan Windows/CI (seperti `node-gyp` pada `better-sqlite3`).
  - Berkas SQLite lokal (`file:local.db`) siap pakai tanpa perlu instalasi Docker/Postgres daemon pada setup awal developer baru.
  - Memiliki migrasi instan dan type inference TypeScript yang sangat akurat.
  - Dapat dialihkan ke database cloud PostgreSQL atau Turso hanya dengan mengganti variabel `DATABASE_URL`.

### C. Jose JWT Cookie Session + BcryptJS

- **Keputusan:** Menggunakan sesi cookie aman HttpOnly yang ditandatangani menggunakan Jose (HS256) dan password hashing Bcrypt (cost 10).
- **Rasional:**
  - Sesi terenkripsi dan ditandatangani dengan rahasia server (`AUTH_SECRET`), mencegah pemalsuan identitas (SEC-08).
  - Bekerja secara universal di Server Actions, Server Components, Route Handlers, dan Next.js Middleware.
  - BcryptJS murni JavaScript sehingga portabel di semua platform OS developer.

### D. Dynamic Navigation Menus Driven by RBAC

- **Keputusan:** Menyimpan definisi menu navigasi di database (`navigation_menus`) dengan relasi kode izin (`required_permission`).
- **Rasional:**
  - Admin dapat mengubah izin suatu role pada form matriks izin, dan seketika menu sidebar yang bersangkutan akan muncul atau hilang bagi pengguna dengan role tersebut.
  - Akses tetap dilindungi di sisi server (Server Actions & Middleware), bukan hanya disembunyikan di antarmuka (FE-06, BE-03).

---

## 3. Konsekuensi & Trade-off

- **Positif:** Setup proyek baru menjadi instan (cukup clone, `pnpm install`, `pnpm db:push`, `pnpm db:seed`, `pnpm dev`).
- **Positif:** Keamanan terjamin sejak hari pertama (zero plaintext password, audit log aktif, proteksi CSRF & XSS default dari Next.js).
- **Kelemahan:** Sesi berbasis cookie JWT stateless membawa hak akses dalam payload; perubahan role pada pengguna aktif memerlukan pembaruan token sesi pada login berikutnya atau sesi refresh.
