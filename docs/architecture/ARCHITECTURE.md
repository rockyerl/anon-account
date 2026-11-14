# ARCHITECTURE DOCUMENTATION: SUNDAWA Next.js Starter

## 1. System Overview

Aplikasi ini menggunakan pola **Feature-Driven Architecture (Vertical Slice)** yang dipadukan dengan Next.js App Router.
Arsitektur dirancang agar setiap fitur bisnis terisolasi secara mandiri (cohesive), menyatukan UI components, Server Actions, Domain Service, Repository/Data Access, dan DTO ke dalam foldernya masing-masing di bawah `src/features/`. Folder `src/app/` berfungsi murni sebagai **Thin Routing Layer**.

```
Browser / Client UI
       │
       ▼
Next.js App Router (app/) & Middleware (middleware.ts) [Thin Routing Layer]
       │
       ▼
Feature Components & Server Actions (features/*/components, actions.ts) [Feature Slice Presentation]
       │
       ▼
Feature Domain & Service Layer (features/*/service.ts, dto.ts)           [Business Logic]
       │
       ▼
Feature Repository Layer (features/*/repository.ts)                     [Data Access]
       │
       ▼
Drizzle ORM & LibSQL Database Driver (db/)                              [Persistence Layer]
```

---

## 2. Dynamic RBAC & Sidebar Navigation Flow

Salah satu fitur kunci dari template ini adalah **Dynamic Sidebar Access based on Role Permissions**:

```mermaid
sequenceDiagram
    autonumber
    actor User as User / Client
    participant MW as Next.js Middleware
    participant Layout as DashboardLayout (Server)
    participant NavSvc as Navigation Service
    participant DB as Drizzle / Database

    User->>MW: Request /dashboard/users
    MW->>MW: Verifikasi Session JWT Cookie & Izin Rute
    alt Tidak Ada Sesi
        MW-->>User: Redirect ke /login
    else Izin Kurang
        MW-->>User: Redirect ke /dashboard/forbidden
    end

    MW->>Layout: Lanjutkan ke Server Component
    Layout->>NavSvc: getDynamicSidebarNavigation(session)
    NavSvc->>DB: Query navigation_menus
    DB-->>NavSvc: Daftar Menu Sistem
    NavSvc->>NavSvc: Filter menu hanya jika user memiliki requiredPermission
    NavSvc-->>Layout: Menu yang Diizinkan (Grouped by Category)
    Layout-->>User: Render Halaman + Sidebar Dinamis
```

---

## 3. Data Model (ERD)

```mermaid
erDiagram
    ROLES ||--o{ USERS : "assigned to"
    ROLES ||--o{ ROLE_PERMISSIONS : "has"
    PERMISSIONS ||--o{ ROLE_PERMISSIONS : "granted via"
    PERMISSIONS ||--o{ NAVIGATION_MENUS : "guards"
    USERS ||--o{ AUDIT_LOGS : "triggers"

    ROLES {
        string id PK
        string name
        string code
        string description
        boolean is_system
        timestamp created_at
        timestamp updated_at
    }

    USERS {
        string id PK
        string name
        string email UK
        string password_hash
        string role_id FK
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    PERMISSIONS {
        string id PK
        string code UK
        string name
        string group
        string description
    }

    ROLE_PERMISSIONS {
        string id PK
        string role_id FK
        string permission_id FK
    }

    NAVIGATION_MENUS {
        string id PK
        string title
        string path
        string icon
        string required_permission
        string category
        integer sort_order
        boolean is_active
    }

    AUDIT_LOGS {
        string id PK
        string actor_id
        string actor_email
        string action
        string resource
        string details
        string ip_address
        timestamp created_at
    }
```

---

## 4. Multi-Layer Defense-in-Depth Authorization (SEC-07, BE-03, FE-06)

1. **Layer 1: Pre-flight Route Guard (Middleware)**
   - Mengecek token sesi di cookie `sundawa_session`.
   - Mengalihkan pengguna tanpa sesi ke `/login`.
   - Mengecek awalan rute (misal `/dashboard/roles` membutuhkan `roles.read`); jika tidak memiliki izin, dialihkan ke `/dashboard/forbidden`.

2. **Layer 2: Server Component Layout & Page Guard**
   - Setiap page server memanggil `await requirePermission("code")`.
   - Menolak eksekusi query data sensitif jika sesi tidak berwenang.

3. **Layer 3: Server Actions Mutation Guard**
   - Setiap mutasi (`createUserAction`, `updateUserAction`, `deleteUserAction`, `createRoleAction`, `updateRoleAction`, `deleteRoleAction`) secara eksplisit memverifikasi izin actor di sisi server sebelum mengeksekusi operasi database.

4. **Layer 4: UI Dynamic Rendering**
   - Sidebar hanya menampilkan menu yang hak aksesnya dimiliki oleh role pengguna.
   - Tombol "Tambah", "Ubah", dan "Hapus" pada tabel hanya dirender jika role memiliki izin aksi terkait.
