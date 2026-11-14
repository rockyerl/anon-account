# PROJECT PROFILE: SUNDAWA Fullstack Next.js Template

**Document ID:** PROJ-SUNDAWA-NEXT-TEMPLATE-001  
**Classification:** Standard L2 (Enterprise-grade fullstack starter with multi-role access control)  
**Version:** 1.0.0  
**Date:** 13 November 2026  
**Status:** Approved for internal enterprise project adoption

---

## 1. Ownership & Governance (BOOT-01, BOOT-07)

- **Product / Template Owner:** CTO / Head of Engineering, SUNDAWA
- **Technical Lead:** Senior Fullstack Architect
- **Security Owner:** AppSec & DevSecOps Lead
- **Target Audience:** Internal engineering teams, project leads, fullstack developers building new web applications and SaaS platforms.

---

## 2. Scope & Purpose (BOOT-01, BOOT-04)

- **Repository Type:** Fullstack Web Application Starter / Template (Frontend + Backend in Next.js App Router).
- **Core Purpose:** Menghilangkan overhead setup awal berulang setiap kali memulai proyek baru. Menyediakan fondasi arsitektur standar SUNDAWA yang mencakup:
  1. Autentikasi sesi aman (HS256 Jose JWT + HttpOnly Cookies + Bcrypt).
  2. Dynamic Role-Based Access Control (RBAC) yang terhubung langsung ke navigasi sidebar.
  3. CRUD User lengkap (create, read, update, delete, status toggle, reset password).
  4. CRUD Role lengkap (create, read, update, delete, permission matrix toggle).
  5. ORM tipe-aman Drizzle dengan LibSQL/SQLite lokal (seamless upgrade ke PostgreSQL/Turso).
  6. Audit logging terpusat untuk setiap aksi krusial (BE-12, SEC-21).

---

## 3. Technology Stack & Runtime (BOOT-03, BOOT-08)

| Layer             | Selected Technology                           | Rationale / Reference                                              |
| ----------------- | --------------------------------------------- | ------------------------------------------------------------------ |
| **Framework**     | Next.js 16 (App Router) + React 19            | Server Components, Server Actions, Zero-API boilerplate            |
| **Language**      | TypeScript 5.x (`strict: true`)               | Strict type checking & zero `any` policy                           |
| **Database ORM**  | Drizzle ORM + `@libsql/client`                | Type-safe, zero C++ native compilation, instant migrations         |
| **Styling**       | Tailwind CSS + Lucide Icons                   | Responsive modern design system, WCAG 2.2 AA readiness             |
| **Security/Auth** | Jose JWT + BcryptJS                           | Edge-ready session cookie, Argon2/Bcrypt password hashing (SEC-05) |
| **Validation**    | Zod                                           | End-to-end schema validation at external boundaries (CODE-10)      |
| **Testing**       | Vitest                                        | Lightning-fast test runner with ESM and TypeScript support         |
| **Quality Gates** | ESLint + Prettier                             | Automated formatting and static analysis (CODE-01, CODE-02)        |
| **Repo Strategy** | Polyrepo template (clean single repo starter) | BOOT-08                                                            |

---

## 4. Non-Functional Requirements & Targets (BOOT-06, PERF-01)

- **Latency (p95):** < 150 ms untuk halaman server-rendered; < 50 ms untuk validasi Server Actions lokal.
- **Availability Target:** 99.9% uptime untuk sistem berbasis template ini.
- **Security Baseline:** OWASP Top 10:2025, OWASP ASVS v5.0 Level 2 compliance.
- **Data Durability:** Single-source migration scripts di `./drizzle` dengan push & seed deterministik.
- **Error Handling:** RFC 9457 structured error format tanpa mengekspos stacktrace internal (BE-04).
