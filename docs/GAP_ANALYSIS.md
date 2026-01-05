# 📊 Gap Analysis: Konsep vs Implementasi

> **Dokumen Referensi:** [ANALISYS.md](./ANALISYS.md)
> **Tanggal Analisis:** 5 Januari 2026
> **Status Project:** Dalam Pengembangan (MVP)

---

## 🎯 Ringkasan Eksekutif

| Aspek | Konsep | Implementasi | Status |
|-------|--------|--------------|--------|
| Role System | 3 roles | 2 roles | ⚠️ Perbedaan |
| Database Schema | 7 modul | 10 tabel | ✅ Tercakup |
| Nota Hybrid | Draft → Valid → Final | Draft → Verified → Completed | ✅ Sesuai |
| Status Lapak | Direncanakan | ✅ Ada (isOpen, emergencyMode) | ✅ Sesuai |
| Audit Trail | Direncanakan | ⚠️ Parsial | 🟡 Perlu Ditingkatkan |
| Cut-off Time | Direncanakan | ❌ Belum ada | 🔴 Gap |

**Skor Kesesuaian: ~75%** — Fondasi kuat, beberapa fitur advanced belum diimplementasi

---

## 1. Role System

### 📋 Konsep (ANALISYS.md)
```
3 Role:
├── Supplier  → Titip produk ke banyak lapak
├── Owner     → Pemilik lapak, bisa punya banyak lapak
└── Admin     → Diangkat owner, kelola lapak tertentu
```

### 💻 Implementasi Aktual
```typescript
// src/lib/server/db/schema.ts
export type UserRole = 'owner' | 'supplier';  // Hanya 2 role!
```

### 📊 Analisis Gap

| Role | Konsep | Implementasi | Status |
|------|--------|--------------|--------|
| Supplier | ✅ Input nota, titip produk | ✅ Lengkap | ✅ |
| Owner | ✅ Punya banyak lapak | ✅ Lengkap | ✅ |
| Admin | ✅ Diangkat owner | ❌ **Belum ada** | 🔴 Gap |

### 🔧 Rekomendasi
**Role Admin belum diimplementasi.** Saat ini owner harus mengelola sendiri. Untuk MVP ini cukup, tapi untuk scaling perlu ditambahkan:

```typescript
// Proposal: Tambah role admin di storeMembers
export type MemberRole = 'member' | 'admin';
export const storeMembers = sqliteTable('store_members', {
    // ... existing fields
    role: text('role').$type<MemberRole>().notNull().default('member'),
});
```

---

## 2. Manajemen Lapak

### 📋 Konsep
- Owner bisa punya banyak lapak
- Lapak punya status (buka/tutup)
- Lapak bisa tutup mendadak dengan notifikasi

### 💻 Implementasi Aktual
```typescript
// stores table - ✅ Lengkap!
{
    ownerId,           // ✅ Multi-lapak supported
    isOpen,            // ✅ Status buka/tutup
    emergencyMode,     // ✅ Tutup mendadak
    announcement,      // ✅ Pengumuman
    operatingDays,     // ✅ Hari operasional
    openTime,          // ✅ Jam buka
    closeTime,         // ✅ Jam tutup
    autoApprove,       // ✅ Auto approve supplier
}
```

### ✅ Status: SESUAI KONSEP
Implementasi lapak sudah sangat lengkap, bahkan melebihi ekspektasi dengan fitur:
- `emergencyMode` untuk tutup mendadak
- `autoApprove` untuk efisiensi
- `visibility` (public/private) untuk discovery

---

## 3. Manajemen Supplier (Member)

### 📋 Konsep
- Supplier bisa titip ke banyak lapak
- Join dengan invite code atau request manual
- Ada proses approval

### 💻 Implementasi Aktual
```typescript
// storeMembers table
{
    status: 'pending' | 'active' | 'suspended' | 'rejected' | 'leaving',
    inviteCodeUsed,        // ✅ Invite code
    requestMessage,        // ✅ Pesan request
    rejectionReason,       // ✅ Alasan ditolak
    rejectedAt,            // ✅ Cooldown period (7 hari)
    leaveReason,           // ✅ Request leave
    leaveRequestedAt,      // ✅ Leave tracking
}

// storeInvites table - ✅ Full featured
{
    code,
    expiresAt,
    maxUses,
    usedCount,
    isActive,
}
```

### ✅ Status: MELEBIHI KONSEP
Implementasi member management sangat komprehensif dengan fitur:
- Cooldown period setelah rejection
- Leave request dengan approval
- Invite code dengan expiration & usage limit

---

## 4. Nota Konsinyasi Hybrid

### 📋 Konsep
```
Status: Draft → Valid → Final
Fitur:
- Foto produk/nota fisik
- Koreksi dengan alasan
- Riwayat perubahan
```

### 💻 Implementasi Aktual
```typescript
// dailyTransactions table
{
    date,              // ✅ Per tanggal
    status: 'draft' | 'verified' | 'completed',  // ✅ Status flow
    totalItemsIn,      // ✅ Total masuk
    totalItemsSold,    // ✅ Total terjual
    totalPayout,       // ✅ Total bayar
    adminNote,         // ✅ Catatan/koreksi
}

// transactionItems table
{
    qtyPlanned,        // ✅ Rencana titip (dari supplier)
    qtyActual,         // ✅ Aktual diterima (validasi lapak)
    qtyReturned,       // ✅ Retur (sisa tidak terjual)
}
```

### 📊 Analisis Gap

| Fitur | Konsep | Implementasi | Status |
|-------|--------|--------------|--------|
| Status flow (Draft→Valid→Final) | ✅ | ✅ (draft→verified→completed) | ✅ |
| Qty planned vs actual | ✅ | ✅ | ✅ |
| Qty returned | ✅ | ✅ | ✅ |
| Admin note/koreksi | ✅ | ✅ | ✅ |
| Foto nota fisik | ✅ | ❌ Belum ada | 🔴 Gap |
| Riwayat perubahan (audit log) | ✅ | ❌ Belum ada | 🔴 Gap |

### 🔧 Rekomendasi
Tambahkan untuk versi selanjutnya:
```typescript
// Proposal: Nota photo
notePhotoUrl: text('note_photo_url'),

// Proposal: Audit log table
export const transactionLogs = sqliteTable('transaction_logs', {
    trxId: integer('trx_id').references(() => dailyTransactions.id),
    action: text('action'), // 'created', 'verified', 'qty_adjusted', etc
    oldValue: text('old_value'),
    newValue: text('new_value'),
    changedBy: integer('changed_by').references(() => users.id),
    reason: text('reason'),
    createdAt: integer('created_at', { mode: 'timestamp' }),
});
```

---

## 5. Produk

### 📋 Konsep
- Produk fleksibel (makanan, minuman, jajan pasar)
- Supplier bisa suggestkan harga
- Owner approve dengan harga final

### 💻 Implementasi Aktual
```typescript
// products table
{
    supplierId,              // ✅ Per supplier
    storeId,                 // ✅ Per lapak
    name, description,       // ✅ Info dasar
    imageUrl,                // ✅ Foto produk
    priceBuy,                // ✅ Harga beli (dari supplier)
    priceSell,               // ✅ Harga jual (final)
    suggestedPriceSell,      // ✅ Rekomendasi supplier!
    status: 'pending' | 'approved' | 'rejected',
    isActive,
}
```

### ✅ Status: SESUAI KONSEP
Fitur `suggestedPriceSell` adalah implementasi yang bagus dari prinsip "supplier bisa suggest, owner yang decide".

---

## 6. Status Lapak Harian & Cut-off

### 📋 Konsep
```
- Status lapak harian (buka/tutup)
- Cut-off time
- Notifikasi otomatis jika tutup
- Nota auto-batal jika supplier tidak datang
```

### 💻 Implementasi Aktual
```typescript
// Store fields
isOpen: boolean,           // ✅ Status buka/tutup
emergencyMode: boolean,    // ✅ Tutup mendadak
openTime, closeTime,       // ✅ Jam operasional

// Notification system
notifications table        // ✅ Ada

// BELUM ADA:
// - Cut-off time enforcement
// - Auto-cancel transaksi
// - Daily status tracking
```

### 📊 Analisis Gap

| Fitur | Status |
|-------|--------|
| Toggle buka/tutup | ✅ Ada |
| Emergency mode | ✅ Ada |
| Jam operasional | ✅ Ada |
| Cut-off time enforcement | 🔴 Belum |
| Auto-cancel draft transaction | 🔴 Belum |
| Daily status history | 🔴 Belum |
| Auto notification on close | 🟡 Parsial |

### 🔧 Rekomendasi
Untuk versi production:
```typescript
// Cron job untuk cut-off
// Setiap jam 11:00 (setelah jam tutup)
if (currentTime >= store.closeTime) {
    // Cancel semua draft transaction hari ini
    await cancelDraftTransactions(storeId, today);
    // Notif ke supplier yang punya draft
    await notifySuppliers(affectedSuppliers);
}
```

---

## 7. Notifikasi

### 📋 Konsep
- Notifikasi untuk berbagai event
- WhatsApp integration (masa depan)

### 💻 Implementasi Aktual
```typescript
// notifications table
export type NotificationType =
    | 'join_request'      // ✅
    | 'join_approved'     // ✅
    | 'join_rejected'     // ✅
    | 'member_kicked'     // ✅
    | 'info'              // ✅
    | 'system';           // ✅
```

### 📊 Analisis Gap

| Fitur | Status |
|-------|--------|
| In-app notification | ✅ Lengkap |
| Mark as read | ✅ Ada |
| Detail URL | ✅ Ada |
| WhatsApp integration | 🔴 TODO |
| Transaction notification | 🔴 Belum ada |
| Store closed notification | 🔴 Belum ada |

### 🔧 Rekomendasi
Tambah notification types:
```typescript
// Proposal
| 'transaction_verified'    // Nota diverifikasi
| 'transaction_completed'   // Transaksi selesai
| 'store_closed'           // Lapak tutup mendadak
| 'product_approved'       // Produk disetujui
| 'product_rejected'       // Produk ditolak
```

---

## 8. Branch/Cabang

### 📋 Konsep
Tidak secara eksplisit disebutkan, tapi tersirat bahwa owner bisa punya banyak "lokasi".

### 💻 Implementasi Aktual
```typescript
// storeBranches table - ✅ Bonus!
{
    storeId,
    name,
    address,
    phone,
    latitude, longitude,
    isMain,
    isActive,
}
```

### ✅ Status: BONUS FEATURE
Implementasi melebihi konsep dengan dukungan multi-branch per store!

---

## 📈 Rekap Kesesuaian per Modul

| # | Modul Konsep | Implementasi | Skor |
|---|--------------|--------------|------|
| 1 | Manajemen Lapak | ✅ Lengkap + Branch | 100% |
| 2 | Manajemen Supplier | ✅ Lengkap + Cooldown | 100% |
| 3 | Nota Konsinyasi Hybrid | ✅ Dasar, ⚠️ No Audit | 80% |
| 4 | Status Lapak Harian | ✅ Dasar, ⚠️ No Cutoff | 70% |
| 5 | Input Penjualan Cepat | ✅ Ada setor flow | 90% |
| 6 | Log & Audit Trail | ⚠️ Logging ada, ❌ DB audit belum | 50% |
| 7 | Rekap Harian & Histori | ✅ Ada + Export CSV | 90% |

**Rata-rata: ~83%** — Fondasi MVP sudah solid!

---

## 🎯 Prinsip Desain: Kesesuaian

| Prinsip | Konsep | Implementasi | Status |
|---------|--------|--------------|--------|
| Fisikal First | Nota fisik tetap wajib | ✅ Qty planned vs actual | ✅ |
| Asynchronous Input | Supplier input dari rumah | ✅ Bisa input sebelum datang | ✅ |
| Audit Trail > Akurasi | Selisih tercatat | ⚠️ adminNote ada, log detail belum | 🟡 |
| Cepat & Tahan Kesalahan | UX jam 03-11 | ⚠️ UX ada, cut-off belum enforce | 🟡 |

---

## 🚀 Roadmap Menuju Kesesuaian 100%

### Phase 1 (MVP Enhancement)
- [ ] Tambah foto nota fisik (notePhotoUrl)
- [ ] Tambah notification types untuk transaksi
- [ ] Implementasi admin role di storeMembers

### Phase 2 (Production Ready)
- [ ] Audit log table untuk transaction changes
- [ ] Cut-off time enforcement dengan cron
- [ ] Auto-cancel draft transactions
- [ ] Daily store status history

### Phase 3 (Scale)
- [ ] WhatsApp integration (WAHA)
- [ ] Riwayat kedisiplinan supplier (private)
- [ ] Analytics & reporting dashboard

---

## ✅ Kesimpulan

**Project ini sudah sangat selaras dengan dokumen konsep.**

### Yang Sudah Tercapai:
1. ✅ Sistem konsinyasi semi-digital — **Berjalan**
2. ✅ Role Supplier & Owner — **Lengkap**
3. ✅ Nota dengan status flow — **Berjalan**
4. ✅ Multi-lapak per owner — **Berjalan**
5. ✅ Multi-lapak per supplier — **Berjalan**
6. ✅ Approval workflow — **Lengkap**

### Yang Perlu Ditambahkan:
1. 🔴 Role Admin (untuk delegasi)
2. 🔴 Audit log detail
3. 🔴 Cut-off time enforcement
4. 🔴 Foto nota fisik
5. 🟡 WhatsApp notification

> *"Implementasinya sudah 83% sesuai konsep. Sisanya adalah fitur advanced yang bisa ditambahkan setelah MVP terbukti berjalan di lapangan."*

---

*Gap analysis completed. Ready for iteration!* 🚀
