# SECURITY GUIDELINES & CONTROLS (SUNDAWA SEC-01 s/d SEC-24)

Dokumen ini mendokumentasikan implementasi kontrol keamanan pada repositori template starter fullstack Next.js SUNDAWA.

---

## 1. Authentication & Session Security (SEC-04, SEC-05, SEC-08)

- **Password Hashing:** Menggunakan algoritma **Bcrypt** dengan salt rounds 10 (`src/lib/auth/password.ts`). Password plaintext tidak pernah disimpan di database atau dicatat di log audit.
- **Session Tokens:** Ditandatangani secara kriptografis menggunakan **Jose** (algoritma HS256) dengan kunci rahasia server (`AUTH_SECRET`). Token tidak dapat dimanipulasi oleh klien.
- **Cookie Flags:**
  - `httpOnly: true`: Mencegah token sesi dibaca oleh script sisi klien (mitigasi XSS token theft).
  - `secure: process.env.NODE_ENV === "production"`: Mengharuskan enkripsi TLS pada lingkungan produksi.
  - `sameSite: "lax"`: Mencegah serangan Cross-Site Request Forgery (CSRF).
  - `path: "/"`: Membatasi jangkauan domain aplikasi.
  - `maxAge: 86400`: Masa berlaku sesi dibatasi hingga 24 jam.

---

## 2. Server-Side Authorization & RBAC (SEC-07, BE-03, FE-06)

- Sisi klien (UI/Sidebar) **hanya bertindak sebagai presentation layer**. Penolakan akses dilakukan secara otoritatif di sisi server.
- Setiap rute dashboard diverifikasi ganda:
  1. Pada `src/middleware.ts` (pre-flight URL matching).
  2. Pada Server Component Layout & Page melalui fungsi `requirePermission(code)`.
  3. Pada Server Action mutasi melalui fungsi `requirePermission(code)`.
- Pengguna dengan role `SUPER_ADMIN` memiliki proteksi integritas: sistem menolak penghapusan atau penonaktifan jika hanya tersisa satu akun Super Admin aktif.

---

## 3. Data Protection, Query Safety & Injection Defense (SEC-09, SEC-11, DB-07)

- **SQL Injection Defense:** Seluruh query database dieksekusi melalui **Drizzle ORM** yang secara otomatis menggunakan parameterized SQL prepared statements.
- **XSS Defense:** React JSX dan Next.js secara otomatis melakukan context-aware HTML encoding pada seluruh output string. Tidak ada penggunaan `dangerouslySetInnerHTML` tanpa sanitasi.
- **Input Validation (CODE-10, BE-02):** Seluruh input dari form dan permintaan eksternal divalidasi menggunakan skema **Zod** sebelum dieksekusi oleh service layer.

---

## 4. Audit Logging & Non-Repudiation (SEC-21, SEC-22, BE-12)

- Seluruh tindakan krusial dicatat di tabel `audit_logs`:
  - `AUTH_LOGIN`, `AUTH_LOGOUT`
  - `USER_CREATE`, `USER_UPDATE`, `USER_DELETE`
  - `ROLE_CREATE`, `ROLE_UPDATE`, `ROLE_DELETE`
- **Masking & Sanitasi (SEC-22):** Password plaintext, token sesi, dan data kredensial tidak pernah disertakan dalam payload log audit.
