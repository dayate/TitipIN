# 📋 Project Status: Mak Unyil - Konsinyasi Digital

> **Last Updated:** 4 Januari 2026
> **Version:** 1.0.0-beta
> **Status:** MVP Ready for Testing

---

## 🎯 Overview

**Mak Unyil** adalah platform konsinyasi digital multi-tenant yang menghubungkan pemilik lapak dengan penyetor/supplier. Platform ini memungkinkan pengelolaan produk titip-jual dengan sistem setoran harian dan tracking penjualan.

### Target Users
- **Owner (Pemilik Lapak)** - Mengelola lapak, produk, anggota, dan transaksi
- **Supplier (Penyetor)** - Mendaftarkan produk, menyetor barang, dan memantau penjualan

---

## 📊 Progress Implementasi

### Summary
| Kategori | Progress |
|----------|----------|
| Authentication | ██████████ 100% |
| Store Management | ██████████ 100% |
| Membership | ██████████ 100% |
| Products | ██████████ 100% |
| Transactions | █████████░ 90% |
| Notifications | ██████████ 100% |
| UI/UX | █████████░ 95% |
| **OVERALL** | **~90%** |

---

### ✅ Completed Features

#### Authentication System
- [x] Login dengan nomor WhatsApp + PIN
- [x] Register dengan pilihan role (Owner/Supplier)
- [x] Reset PIN
- [x] Session management dengan 30 hari expiry
- [x] Secure PIN hashing dengan bcrypt

#### Store Management
- [x] Create, Read, Update, Delete lapak
- [x] Toggle buka/tutup lapak
- [x] Setting visibility (public/private)
- [x] Auto-approve via invite code (default: ON)
- [x] Operating hours configuration
- [x] Emergency mode toggle
- [x] Announcement system

#### Membership System
- [x] Join request ke lapak
- [x] Approve/reject member dengan alasan
- [x] Kick member
- [x] Leave request dengan approval workflow
- [x] Rejection cooldown 7 hari
- [x] Invite code system dengan expiry dan usage limit

#### Product Management
- [x] CRUD produk dengan image upload
- [x] Suggested price dari supplier
- [x] Final price dari admin/owner
- [x] Approval workflow (pending → approved/rejected)
- [x] Product status toggle

#### Transaction System
- [x] Daily transaction creation
- [x] Status flow: Draft → Verified → Completed
- [x] Input qty_planned (malam sebelumnya)
- [x] Verify qty_actual (subuh, saat setor)
- [x] Input qty_returned (sore, sisa tidak laku)
- [x] Auto-calculate: qty_sold = actual - returned
- [x] Payout calculation per supplier
- [x] Export history ke CSV
- [x] Modal-based setoran input

#### Notification System
- [x] In-app notifications
- [x] Mark as read/unread
- [x] Notification types (join, approved, rejected, etc.)
- [x] Responsive dropdown di header
- [x] Notification center page

#### UI/UX
- [x] Dark/Light mode toggle
- [x] Responsive sidebar dengan collapse
- [x] Modern gradient headers
- [x] shadcn-svelte components
- [x] Mobile-first responsive design
- [x] Tooltips pada action buttons

---

### ⏳ Pending Features

| Feature | Priority | Notes |
|---------|----------|-------|
| Community (Posts & Comments) | 🟡 Medium | Schema belum diimplementasi |
| WhatsApp Integration (WAHA) | 🟡 Medium | Untuk notifikasi real-time |
| Store Branches | 🟢 Low | Schema ada, UI belum |
| Analytics Charts | 🟢 Low | Dashboard dengan grafik |
| Export Report PDF | 🟢 Low | Reporting yang lebih lengkap |

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| Framework | SvelteKit 5 (SSR) |
| Language | TypeScript |
| Styling | TailwindCSS |
| UI Components | shadcn-svelte |
| Database | SQLite (dev) / PostgreSQL (prod) |
| ORM | Drizzle ORM |
| Icons | Lucide Svelte |
| State | Svelte 5 Runes |

---

## 📁 Project Structure

```
src/
├── lib/
│   ├── components/     # UI components
│   │   ├── ui/         # shadcn-svelte base
│   │   └── *.svelte    # Custom components
│   ├── server/         # Server-side logic
│   │   ├── db/         # Database & schema
│   │   ├── auth.ts     # Authentication
│   │   ├── stores.ts   # Store management
│   │   ├── members.ts  # Membership
│   │   ├── products.ts # Products
│   │   ├── transactions.ts
│   │   ├── notifications.ts
│   │   └── invites.ts  # Invite codes
│   └── utils.ts        # Utilities
├── routes/
│   ├── admin/          # Owner panel (7 sections)
│   ├── app/            # Supplier panel (8 sections)
│   ├── auth/           # Authentication pages
│   └── join/           # Invite join flow
└── app.css             # Global styles
```

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Setup database
npm run db:push

# Run development server
npm run dev

# Build for production
npm run build
```

---

## 📝 Configuration

### Environment Variables
```env
DATABASE_URL=file:./dev.db  # SQLite for dev
# DATABASE_URL=postgresql://... # PostgreSQL for prod
```

### Database Schema
Database menggunakan 10 tabel utama:
- `users` - User accounts
- `sessions` - Auth sessions
- `stores` - Store/lapak data
- `store_members` - Membership relations
- `store_invites` - Invite codes
- `products` - Product catalog
- `daily_transactions` - Transaction headers
- `transaction_items` - Transaction line items
- `notifications` - In-app notifications

---

## 🔜 Roadmap

### v1.1.0 (Next Release)
- [ ] Community feature implementation
- [ ] WhatsApp notification integration
- [ ] Analytics dashboard with charts

### v1.2.0
- [ ] Store branches management
- [ ] Multi-currency support
- [ ] Export report to PDF

### v2.0.0
- [ ] Mobile app (React Native / Flutter)
- [ ] POS integration
- [ ] AI-powered sales prediction

---

*Documentation maintained by the development team*
