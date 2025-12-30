# Mak Unyil - Konsinyasi Digital

Platform multi-lapak untuk sistem konsinyasi digital dengan dukungan multi-tenant.

## 🚀 Fitur Utama

- **Multi-Lapak**: Dukung banyak lapak dengan pemilik masing-masing
- **2 Role**: Pemilik Lapak (Owner) dan Penyetor (Supplier)
- **Sistem Gabung**: Supplier bisa request join ke lapak
- **CRUD Produk + Foto**: Kelola produk dengan upload gambar
- **Komunitas 2 Level**: Global (semua user) + Lokal (per lapak)
- **Notifikasi WhatsApp**: Integrasi dengan WAHA API
- **Multi-Cabang**: Satu lapak bisa punya banyak cabang

## 🛠 Tech Stack

- **Framework**: SvelteKit (SSR)
- **Bahasa**: TypeScript
- **Styling**: TailwindCSS + shadcn-svelte
- **Database**: SQLite (dev) / PostgreSQL (prod) + Drizzle ORM
- **Notifikasi**: WAHA (WhatsApp HTTP API)

## 📦 Instalasi

```bash
# Clone repository
git clone <repo-url>
cd TolongJualin

# Install dependencies
npm install

# Push database schema
npm run db:push

# Jalankan development server
npm run dev
```

## 📁 Struktur Routes

### Public
- `/` - Landing page
- `/stores` - Explore lapak
- `/stores/[slug]` - Detail lapak
- `/community` - Komunitas global

### Supplier (`/app`)
- `/app` - Dashboard supplier (daftar lapak)
- `/app/profile` - Edit profil
- `/app/[storeId]` - Dashboard per-lapak
- `/app/[storeId]/setor` - Setor barang
- `/app/[storeId]/products` - Kelola produk
- `/app/[storeId]/history` - Riwayat transaksi
- `/app/[storeId]/community` - Komunitas lapak

### Owner (`/owner`)
- `/owner` - Dashboard owner (daftar lapak dimiliki)
- `/owner/profile` - Edit profil
- `/owner/create-store` - Buat lapak baru
- `/owner/[storeId]` - Kelola lapak spesifik

### API (`/api`)
- `/api/auth/*` - Autentikasi
- `/api/stores/*` - CRUD lapak
- `/api/stores/[storeId]/members` - Kelola anggota
- `/api/stores/[storeId]/products` - CRUD produk
- `/api/stores/[storeId]/transactions` - Transaksi
- `/api/community/*` - Komunitas
- `/api/users/profile` - Profil user
- `/api/upload` - Upload gambar

## 📚 Dokumentasi

- [PRD.md](./PRD.md) - Product Requirements
- [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) - Skema Database
- [TECH_STACK.md](./TECH_STACK.md) - Detail Tech Stack
- [TASK.md](./TASK.md) - Checklist Implementasi

## 🔧 Scripts

```bash
npm run dev        # Development server
npm run build      # Production build
npm run db:push    # Push schema ke database
npm run db:studio  # Buka Drizzle Studio
```
