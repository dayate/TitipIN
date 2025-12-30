# Product Requirements Document (PRD)
## Project Name: Mak Unyil - Konsinyasi Digital Multi-Lapak

### 1. Latar Belakang & Masalah
* **Bottleneck Operasional:** Input data manual saat subuh menyebabkan antrean dan human error.
* **Transparansi:** Penyetor butuh kejelasan data (stok masuk vs terjual) dan keuangan.
* **Skalabilitas:** Sistem perlu mendukung banyak lapak dan penyetor dalam satu platform.

### 2. Solusi: Multi-Tenant Consignment Platform
Platform digital yang memungkinkan:
- Banyak **pemilik lapak** mengelola bisnis konsinyasi mereka
- Banyak **penyetor** menitipkan produk ke berbagai lapak
- **Komunitas** untuk berbagi informasi antar pengguna

### 3. User Roles

| Role | Deskripsi | Kapabilitas |
|------|-----------|-------------|
| **Owner** | Pemilik Lapak | Buat & kelola lapak, cabang, anggota, validasi, retur |
| **Supplier** | Penyetor | Join lapak, ajukan produk, input setoran, lihat riwayat |

### 4. Fitur Utama (Core Features)

#### 4.1 Authentication
- Login via WhatsApp + PIN
- Register dengan pilihan role (Owner/Supplier)
- Lupa PIN (request reset ke admin)

#### 4.2 Store Management (Owner)
- CRUD Lapak & Cabang
- Set jam buka/tutup per lapak
- Mode darurat (tutup + broadcast WA)
- Kelola anggota (approve/reject/suspend)
- Invite penyetor via WhatsApp link

#### 4.3 Membership (Supplier)
- Cari & explore lapak
- Request join (isi formulir)
- Terima undangan owner
- Multi-lapak (join ke banyak lapak)

#### 4.4 Product Management
- CRUD Produk dengan foto
- Status approval (pending → approved/rejected)
- Produk per lapak terpisah

#### 4.5 Transaction Flow
- **Zona Malam:** Input rencana setor (draft)
- **Zona Subuh:** Validasi fisik oleh owner
- **Zona Pagi:** Input retur/sisa
- **Auto-calculate:** Terjual = Aktual - Returned

#### 4.6 Finance
- Kalkulasi otomatis: `(Terjual x Harga Setor)`
- Riwayat per hari/minggu/bulan
- Laporan per supplier/produk

#### 4.7 Community
- **Global Community:** Semua user bisa posting & komentar
- **Local Community:** Per lapak, hanya anggota yang bisa akses

#### 4.8 Notification
- WhatsApp Blast via WAHA API
- Event: Approval, Transaksi, Pengumuman

### 5. Non-Functional Requirements
- **Platform:** Web-based PWA (Mobile First)
- **Performance:** Ringan untuk HP low-end
- **Availability:** Online 24/7
- **Multi-tenant:** Isolated data per lapak