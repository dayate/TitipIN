# 🚀 Implementation Plan: Mak Unyil - Konsinyasi Digital

> **Berdasarkan:** [GAP_ANALYSIS.md](./GAP_ANALYSIS.md) & [ANALISYS.md](./ANALISYS.md)
> **Tanggal:** 5 Januari 2026
> **Target:** Mencapai kesesuaian 100% dengan dokumen konsep

---

## 📊 Overview

| Phase | Fokus | Estimasi | Prioritas |
|-------|-------|----------|-----------|
| **Phase 0** | Bugfix & Stabilisasi | 1-2 hari | 🔴 Critical |
| **Phase 1** | MVP Enhancement | 3-5 hari | 🔴 High |
| **Phase 2** | Production Ready | 5-7 hari | 🟡 Medium |
| **Phase 3** | Scale & Advanced | 7-14 hari | 🟢 Low |

---

## ✅ Phase 0: Bugfix & Stabilisasi (COMPLETED)

> **Tujuan:** Memperbaiki issue dari CODE_REVIEW.md sebelum menambah fitur baru
> **Status:** ✅ Selesai pada 5 Januari 2026

### 0.1 Testing Foundation
- [x] Install testing framework
  ```bash
  npm install -D vitest @testing-library/svelte jsdom
  ```
- [x] Setup vitest config (`vitest.config.ts`)
- [x] Tulis unit test untuk:
  - [x] Rate limiter (`src/tests/rateLimit.test.ts` - 6 tests)
  - [x] Zod schemas (`src/tests/schemas.test.ts` - 20 tests)
  - [x] Sanitization & batch queries (`src/tests/batchQueries.test.ts` - 9 tests)

### 0.2 Code Fixes
- [x] Fix `deleteProduct` return value (`src/lib/server/products.ts`)
- [x] Add input sanitization (`src/lib/server/sanitize.ts`):
  - [x] `escapeHtml()`, `sanitizeInput()`
  - [x] `sanitizeAnnouncement()`, `sanitizeAdminNote()`
  - [x] `sanitizeReason()`, `sanitizeMessage()`

### 0.3 Development Experience
- [x] Tambah `.vscode/settings.json` untuk Tailwind v4 IntelliSense

**Deliverable:** ✅ 35 tests passed, codebase stabil

---

## ✅ Phase 1: MVP Enhancement (COMPLETED)

> **Tujuan:** Melengkapi fitur dasar yang sudah berjalan + notification yang lebih lengkap
> **Status:** ✅ Selesai pada 5 Januari 2026

### 1.1 Extended Notification Types

**File:** `src/lib/server/db/schema.ts` ✅

```typescript
// IMPLEMENTED - 7 notification types baru
export type NotificationType =
    | 'join_request' | 'join_approved' | 'join_rejected' | 'member_kicked'
    | 'leave_request'        // ✅ Request keluar dari lapak
    | 'leave_approved'       // ✅ Request keluar disetujui
    | 'product_approved'     // ✅ Produk disetujui
    | 'product_rejected'     // ✅ Produk ditolak
    | 'transaction_verified' // ✅ Nota diverifikasi
    | 'transaction_completed'// ✅ Transaksi selesai
    | 'store_closed'         // ✅ Lapak tutup mendadak
    | 'info' | 'system';
```

**Tasks:**
- [x] Update schema dengan notification types baru
- [x] Tambah notification functions di `notifications.ts`:
  - [x] `notifyProductApproved()`, `notifyProductRejected()`
  - [x] `notifyTransactionVerified()`, `notifyTransactionCompleted()`
  - [x] `notifyStoreClosed()`, `notifyLeaveApproved()`
- [x] Update routes dengan proper notification types:
  - [x] `products/+page.server.ts` - product_approved, product_rejected
  - [x] `validation/+page.server.ts` - transaction_verified
  - [x] `return/+page.server.ts` - transaction_completed
  - [x] `settings/+page.server.ts` - emergencyMode action

### 1.2 Foto Nota Fisik

**File:** `src/lib/server/db/schema.ts` ✅

- [x] Tambah kolom `notePhotoUrl` di schema
- [x] Run `npm run db:push` untuk update database
- [ ] Update form setor untuk upload foto nota *(UI - deferred)*
- [ ] Update UI admin untuk menampilkan foto nota *(UI - deferred)*

### 1.3 Admin Role (Delegasi)

**File:** `src/lib/server/db/schema.ts` ✅

```typescript
// IMPLEMENTED
export type MemberRole = 'member' | 'admin';
// role field added to storeMembers table
```

**Tasks:**
- [x] Tambah field `role` di `storeMembers`
- [x] Buat fungsi `promoteToAdmin()` dan `demoteFromAdmin()` di `members.ts`
- [x] Tambah `isStoreAdmin()` dan `getStoreAdmins()` functions
- [x] Buat UI untuk owner mengelola admin di `/admin/members`
- [x] Update auth hook (`hooks.server.ts`) untuk check admin access
- [x] Tambah `promoteAdmin` dan `demoteAdmin` actions

### 1.4 Product Notification Integration

- [x] Ketika produk di-approve, kirim notif ke supplier
- [x] Ketika produk di-reject, kirim notif ke supplier dengan alasan

**Deliverable:** ✅ Notification lengkap, schema updated, admin role implemented

---

## ✅ Phase 2: Production Ready (COMPLETED)

> **Tujuan:** Fitur untuk operasional nyata + audit trail
> **Status:** ✅ Selesai pada 5 Januari 2026

### 2.1 Audit Log System ✅

**Files Created:**
- `src/lib/server/audit.ts` - Helper functions
- Schema: `auditLogs` table

**Tasks:**
- [x] Tambah tabel `auditLogs` dengan 12 action types
- [x] Buat `logAudit()` helper function
- [x] Buat convenience functions: `logTransactionAudit`, `logProductAudit`, dll
- [ ] Integrate di routes (transaction, product, member)
- [ ] Buat UI untuk melihat audit log di admin dashboard

### 2.2 Cut-off Time Enforcement ✅

**Files Created:**
- `src/lib/server/cutoff.ts` - Processing functions
- `src/routes/api/cron/cutoff/+server.ts` - Protected API endpoint

**Tasks:**
- [x] Tambah status `cancelled` di TransactionStatus
- [x] Buat fungsi `processDailyCutoff(storeId)`
- [x] Buat fungsi helper: `getStoreCutoffTime`, `isPastCutoff`, `getTimeUntilCutoff`
- [x] Buat API endpoint `/api/cron/cutoff` (protected with Bearer token)
- [ ] Setup external cron (Vercel Cron / GitHub Actions)
- [ ] UI: Tampilkan warning/countdown di halaman setor

### 2.3 Daily Store Status History ✅

**Files Created:**
- `src/lib/server/storeStatus.ts` - Status logging functions
- Schema: `dailyStoreStatus` table

**Tasks:**
- [x] Tambah tabel `dailyStoreStatus`
- [x] Buat `logStoreOpened`, `logStoreClosed`, `logEmergencyClose` functions
- [x] Integrate emergency close logging ke settings route
- [ ] Buat UI history status lapak di admin

### 2.4 Storage Strategy

> **Keputusan:** Tetap pakai Local Storage untuk development phase

**Current Implementation:**
```
static/uploads/
├── products/      # Gambar produk
├── avatars/       # Foto profil
└── notes/         # Foto nota (akan ditambahkan)
```

**Development Phase:**
- [x] Local storage sudah berjalan
- [ ] Abstract storage interface (opsional untuk transition)

**Production Options (untuk nanti):**
| Service | Free Tier | Pros |
|---------|-----------|------|
| Supabase Storage | 1GB | Easy setup, CDN |
| Cloudflare R2 | 10GB | S3-compatible, no egress |
| MinIO (self-host) | ∞ | 100% free, S3-compatible |

### 2.5 Rate Limiter Persistence ✅

**Files Created:**
- `src/lib/server/rateLimitPersistent.ts` - SQLite-based rate limiter with memory fallback

**Tasks:**
- [x] Tambah tabel `rateLimits` di schema
- [x] Buat `rateLimitPersistent.ts` dengan:
  - [x] `checkRateLimitPersistent()` - SQLite storage
  - [x] Memory fallback jika database error
  - [x] `cleanupExpiredRateLimits()` - Cleanup utility
  - [x] Pre-configured `persistentRateLimiter` object

**Deliverable:** ✅ Phase 2 Complete - Audit trail, cut-off time, store status, persistent rate limiter

---

## 🟡 Phase 3: Scale & Advanced (PARTIAL)

> **Tujuan:** Fitur advanced untuk scaling dan engagement
> **Status:** 3.2, 3.3, 3.4 selesai | 3.1, 3.5 skipped

### 3.1 WhatsApp Integration (WAHA) ⏭️ SKIPPED

_(Akan diimplementasi nanti jika diperlukan)_

### 3.2 Supplier Reliability Score ✅

**Files Created:**
- `src/lib/server/reliability.ts`
- Schema: `supplierStats` table

**Tasks:**
- [x] Buat tabel untuk tracking supplier reliability
- [x] Update stats setiap transaksi selesai
- [x] Hitung accuracy rate dan reliability score
- [x] Integrate ke return route

### 3.3 Analytics Dashboard ✅

**Files Created:**
- `src/lib/server/analytics.ts`

**Tasks:**
- [x] Owner Dashboard: `getStoreDashboardData`
- [x] Revenue by period: `getRevenueByPeriod`
- [x] Supplier Dashboard: `getSupplierDashboardData`

### 3.4 Advanced Reporting ✅

**Files Created:**
- `src/lib/server/reporting.ts`

**Tasks:**
- [x] `generateWeeklyReport`
- [x] `generateMonthlyReport`
- [x] Export: `reportToCSV`, `reportToText`

### 3.5 Mobile PWA Optimization ⏭️ SKIPPED

_(Akan diimplementasi nanti jika diperlukan)_

### 3.6 UI Implementation ✅

**Pages Created:**
- `src/routes/admin/stores/[id]/analytics/` - Analytics dashboard
- `src/routes/admin/stores/[id]/reliability/` - Supplier reliability scores
- `src/routes/admin/stores/[id]/reports/` - Weekly/monthly reports
- `src/routes/admin/stores/[id]/audit-log/` - Audit trail viewer

**Features:**
- [x] Revenue chart dengan period selector (7/30/90 hari)
- [x] Top suppliers dengan reliability scores
- [x] Low reliability warning alerts
- [x] Report generation dengan CSV export
- [x] Change history viewer dengan formatted actions
- [x] Navigation links di store dashboard

**Deliverable:** ✅ Phase 3 Complete - Reliability, analytics, reporting + full UI

---

## 📋 Task Tracking

### Status Legend
- [ ] Not started
- [/] In progress
- [x] Completed
- ⏭️ Skipped

### Current Status
**✅ Phase 0-3 Complete** (excluding 3.1 WhatsApp & 3.5 PWA)

---

## 🗓️ Actual Timeline

```
5 Jan 2026: Phase 0-1 Complete (Foundation + MVP)
5 Jan 2026: Phase 2 Complete (Production Ready)
5 Jan 2026: Phase 3 Complete (Scale & Advanced + UI)
```

---

## 📝 Notes

### Dependencies
- Phase 2 requires Phase 1 completion
- Cloud storage should be done early in Phase 2
- WhatsApp can be done independently

### Risk Mitigation
- Test database migrations on dev first
- Keep backup before schema changes
- Feature flags for new features

### Definition of Done
- [ ] Feature implemented
- [ ] Tests written (if applicable)
- [ ] UI implemented
- [ ] Documentation updated
- [ ] Tested on mobile viewport

---

> *Plan ini akan di-update seiring progress development.*

**Last Updated:** 5 Januari 2026
