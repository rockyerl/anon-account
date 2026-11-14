# OPERATIONAL RUNBOOK: SUNDAWA Next.js Starter

---

## 1. Local Development Bootstrap

Langkah cepat menjalankan aplikasi di mesin lokal developer:

```bash
# 1. Kloning repositori & salin berkas environment
cp .env.example .env

# 2. Instal dependensi
pnpm install

# 3. Sinkronisasi skema database SQLite lokal
pnpm db:push

# 4. Jalankan seeder untuk mengisi data awal (role, menu dinamis, pengguna demo)
pnpm db:seed

# 5. Jalankan server pengembangan
pnpm dev
```

Buka peramban di `http://localhost:3000`.

---

## 2. Kredensial Pengujian Bawaan (Demo)

| Role            | Email                   | Password       | Hak Akses Sidebar                              |
| --------------- | ----------------------- | -------------- | ---------------------------------------------- |
| **Super Admin** | `superadmin@sundawa.id` | `Password123!` | Dashboard, Laporan, Pengguna, Role & Hak Akses |
| **Admin**       | `admin@sundawa.id`      | `Password123!` | Dashboard, Laporan, Pengguna, Lihat Role       |
| **Staff**       | `staff@sundawa.id`      | `Password123!` | Dashboard, Laporan (Pengguna & Role dibatasi)  |

---

## 3. Prosedur Perubahan Skema Database (DBSET-02, DB-16)

Jika Anda menambahkan tabel atau kolom baru di `src/db/schema.ts`:

1. **Lingkungan Lokal:**
   ```bash
   pnpm db:push
   ```
2. **Generasi Berkas Migrasi untuk Produksi:**
   ```bash
   pnpm db:generate
   ```
   Berkas migrasi SQL ber-versi akan tersimpan di direktori `./drizzle`.
3. **Melihat isi database via Web GUI:**
   ```bash
   pnpm db:studio
   ```

---

## 4. Disaster Recovery & Backup (DBSET-10, DB-18)

- **Database SQLite / LibSQL:**
  - Backup berkas `local.db` secara berkala sebelum pembaruan besar:
    ```bash
    sqlite3 local.db ".backup 'backup_$(date +%Y%m%d_%H%M%S).db'"
    ```
  - Untuk lingkungan produksi yang menggunakan Turso / PostgreSQL, ikuti prosedur automated point-in-time recovery (PITR) sesuai cloud provider.
