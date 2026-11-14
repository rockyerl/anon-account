# SUNDAWA Fullstack Next.js Template Starter

> **Standar Template Fullstack Enterprise** yang siap pakai untuk proyek baru tanpa perlu setup berulang. Dilengkapi dengan Autentikasi Sesi Aman, Dynamic RBAC, CRUD Pengguna, CRUD Role dengan matriks akses sidebar dinamis, dan Drizzle ORM.

Mengikuti standar tata kelola: **SUNDAWA Code Setup Standards v1.0** & **SUNDAWA Engineering Standards v1.0**.

---

## 🚀 Fitur Utama

- **⚡ Next.js 16 (App Router) + React 19:** Server Components, Server Actions, performa instan dengan Turbopack.
- **🛡️ Autentikasi Sesi Mandiri & Aman (SEC-04, SEC-05, SEC-08):**
  - Token sesi ditandatangani secara kriptografis menggunakan **Jose** (HS256).
  - Cookie `HttpOnly`, `SameSite=Lax`, dan `Secure` pada mode produksi.
  - Password hashing menggunakan **Bcrypt** dengan salt round 10.
- **🎛️ Role-Based Access Control (RBAC) Dinamis:**
  - Sidebar aplikasi secara otomatis menyesuaikan menu yang tampil berdasarkan role pengguna yang sedang login.
  - Matriks perizinan dinamis: Admin dapat menambah role baru, mengatur izin menu, dan seketika menu sidebar akan beradaptasi.
  - Multi-layer defense-in-depth: Route guard pada Middleware, Server Component Layout/Page guard, dan Server Action mutation guard (BE-03, SEC-07).
- **👥 CRUD Pengguna Lengkap:**
  - Tambah, ubah, hapus pengguna dengan pencarian dan filter role.
  - Pengaktifan/penonaktifan akun, reset kata sandi, dan proteksi anti-hapus diri sendiri serta anti-hapus Super Admin terakhir.
- **🛡️ CRUD Role & Permission Matrix:**
  - Pembuatan role kustom dengan kode unik (misal: `AUDITOR`, `OPERATOR`).
  - Matriks checkbox izin menu dan izin aksi granular.
  - Proteksi role sistem bawaan dari penghapusan tidak sengaja.
- **🗄️ Drizzle ORM + LibSQL / SQLite Lokal:**
  - Driver ringan tanpa dependensi C++ native compiler (`node-gyp`).
  - Berkas database SQLite lokal (`file:local.db`) siap pakai tanpa instalasi database server lokal.
  - Kompatibel dan mudah dialihkan ke PostgreSQL atau Turso.
- **📝 Audit Logging Terpusat (BE-12, SEC-21):**
  - Merekam setiap aktivitas login, mutasi pengguna, dan perubahan role pada tabel `audit_logs` tanpa mengekspos data kredensial.
- **🎨 UI Modern & Responsif:**
  - Dibangun dengan Tailwind CSS dan icon Lucide React.
  - Dilengkapi dialog modal aksesibel, indikator badge, responsive mobile drawer, dan halaman 403 Forbidden kustom.

---

## 📋 Prasyarat Sistem

- **Node.js:** Versi `>= 20.x` (Direkomendasikan Node.js 22 LTS / 24)
- **Package Manager:** `pnpm` (Versi `>= 9.x` atau `12.x`)
- **Sistem Operasi:** Windows / Linux / macOS

---

## 🛠️ Panduan Memulai Cepat (Local Setup)

### 1. Kloning Repositori & Salin Konfigurasi Environment

```bash
cp .env.example .env
```

### 2. Instal Dependensi

```bash
pnpm install
```

### 3. Inisialisasi Database & Migrasi Skema

```bash
pnpm db:push
```

### 4. Jalankan Database Seeder

Perintah ini akan mengisi hak akses standar, menu navigasi, role bawaan, dan 3 akun pengguna uji coba:

```bash
pnpm db:seed
```

### 5. Jalankan Server Pengembangan

```bash
pnpm dev
```

Buka peramban di [http://localhost:3000](http://localhost:3000).

---

## 🔑 Akun Uji Coba Bawaan (Demo Credentials)

Pada halaman login (`/login`), terdapat tombol cepat satu klik untuk menguji ketiga role berikut:

| Akun            | Email                   | Kata Sandi     | Akses Menu Sidebar                             | Keterangan                                      |
| --------------- | ----------------------- | -------------- | ---------------------------------------------- | ----------------------------------------------- |
| **Super Admin** | `superadmin@sundawa.id` | `Password123!` | Dashboard, Laporan, Pengguna, Role & Hak Akses | Akses tanpa batas ke seluruh fitur & mutasi     |
| **Admin**       | `admin@sundawa.id`      | `Password123!` | Dashboard, Laporan, Pengguna, Role (Read-only) | Mengelola akun pengguna, melihat daftar role    |
| **Staff**       | `staff@sundawa.id`      | `Password123!` | Dashboard, Laporan                             | **Menu Pengguna & Role disembunyikan otomatis** |

---

## 📜 Universal Command Contract (SUNDAWA Kontrak Perintah)

Sesuai standar SUNDAWA Bagian 12, repositori ini menyediakan perintah terstandarisasi:

| Perintah            | Fungsi / Tujuan                                                                         |
| ------------------- | --------------------------------------------------------------------------------------- |
| `pnpm dev`          | Menjalankan server aplikasi Next.js lokal                                               |
| `pnpm build`        | Membangun artefak produksi yang teroptimasi                                             |
| `pnpm start`        | Menjalankan build produksi secara lokal                                                 |
| `pnpm lint`         | Menjalankan analisis statis kode menggunakan ESLint                                     |
| `pnpm typecheck`    | Menjalankan verifikasi tipe TypeScript (`tsc --noEmit`)                                 |
| `pnpm format`       | Menerapkan format kode standar menggunakan Prettier                                     |
| `pnpm format:check` | Memverifikasi kepatuhan format kode tanpa mengubah berkas                               |
| `pnpm test`         | Menjalankan suite pengujian unit & integrasi menggunakan Vitest                         |
| `pnpm db:push`      | Menerapkan skema Drizzle langsung ke database SQLite                                    |
| `pnpm db:generate`  | Menghasilkan berkas migrasi SQL untuk deployment produksi                               |
| `pnpm db:seed`      | Mengisi data awal izin, menu, role, dan akun demo                                       |
| `pnpm db:studio`    | Membuka Drizzle Studio GUI di peramban untuk inspeksi database                          |
| `pnpm check`        | **Quality Gate:** Menjalankan `format:check`, `lint`, `typecheck`, dan `test` sekaligus |

---

## 🏛️ Struktur Direktori Repositori

```text
com.template/
├── .github/
│   ├── workflows/ci.yml         # Otomasi CI Quality Gate
│   ├── CODEOWNERS               # Kebijakan kepemilikan kode
│   └── PULL_REQUEST_TEMPLATE.md # Standar review PR SUNDAWA
├── docs/
│   ├── PROJECT_PROFILE.md       # Profil proyek & klasifikasi L1/L2/L3
│   ├── architecture/
│   │   ├── ARCHITECTURE.md      # Diagram arsitektur Feature-Driven & aliran RBAC
│   │   └── adr/ADR-001-...md    # Architecture Decision Record
│   ├── security/
│   │   └── SECURITY_GUIDELINES.md # Panduan keamanan OWASP ASVS
│   └── runbooks/
│       └── RUNBOOK.md           # Panduan operasional & pemulihan
├── src/
│   ├── app/                     # Thin Routing Layer (Next.js App Router)
│   │   ├── dashboard/           # Rute terproteksi sesi & RBAC
│   │   │   ├── users/page.tsx   # Wire-up data ke UserManagementView
│   │   │   ├── roles/page.tsx   # Wire-up data ke RoleManagementView
│   │   │   ├── reports/page.tsx # Wire-up data ke AuditLogsView
│   │   │   ├── forbidden/page.tsx # Halaman 403 Forbidden Kustom
│   │   │   ├── layout.tsx       # Dynamic layout dengan Sidebar
│   │   │   └── page.tsx         # Dashboard overview view
│   │   ├── login/page.tsx       # Halaman otentikasi login
│   │   ├── globals.css          # Styling Tailwind CSS
│   │   └── layout.tsx           # Root HTML layout
│   ├── features/                # 📦 Feature-Driven Slices (UI + Logika Bisnis)
│   │   ├── auth/                # LoginForm, Service, DTO, Server Actions
│   │   ├── users/               # Table, Create/Edit/Delete Modals, Service, Repo, Actions
│   │   ├── roles/               # Cards, PermissionMatrix, Modals, Service, Repo, Actions
│   │   ├── navigation/          # Sidebar, Header, DynamicIcon, NavService
│   │   ├── dashboard/           # DashboardOverview
│   │   └── reports/             # AuditLogsView & Service
│   ├── shared/                  # 🧱 Reusable UI Primitives (Modal, Badge)
│   ├── db/                      # Konfigurasi Drizzle ORM, schema & seeder
│   ├── lib/                     # Utilitas infrastruktur (Auth session, Bcrypt, Audit, Env)
│   └── middleware.ts            # Route protection & pre-flight security guard
├── tests/
│   └── unit/                    # Pengujian unit Vitest (Password, Session, RBAC)
├── .editorconfig                # Normalisasi indentasi & encoding
├── .gitattributes               # Normalisasi LF line-endings
├── .gitignore                   # Proteksi kredensial, DB lokal, dan build output
├── .env.example                 # Dokumentasi environment variables
├── AGENTS.md                    # Panduan batasan dan tata kelola AI Coding Agent
├── drizzle.config.ts            # Konfigurasi Drizzle Kit
├── package.json                 # Manifest dependensi & skrip universal
└── README.md                    # Dokumentasi utama repositori
```

---

## 🔒 Kebijakan Keamanan & Data (SEC-01 s/d SEC-24)

1. **Zero Secret in Repository:** Berkas `.env` tidak pernah dikomit ke repositori.
2. **Server Authority:** Validasi dan izin ditegakkan secara mutlak di sisi server.
3. **Structured Audit Trail:** Setiap mutasi pengguna dan role dicatat secara permanen dengan actor, action, timestamp, dan detail perubahan tanpa membocorkan rahasia.

---

## 👥 Dukungan & Pemeliharaan

- **Owner:** Engineering Lead, SUNDAWA
- **Dukungan Teknis:** Tim Platform & DevOps SUNDAWA
- **Lisensi:** Proprietary / Hak Cipta Internal SUNDAWA
