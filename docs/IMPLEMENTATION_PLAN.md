# Implementation Plan

## Phase 1: Foundation & Infrastructure
* [ ] Setup Repository (SvelteKit + TypeScript).
* [ ] Setup Docker Compose (App + Postgres + Waha).
* [ ] Config Drizzle ORM & Connect to DB.
* [ ] Setup TailwindCSS & Basic UI Layout (Mobile View).

## Phase 2: User Management & Master Data
* [ ] Create Auth Logic (Register, Login via WA/PIN).
* [ ] Create Admin Dashboard: Approve User.
* [ ] Create Product Management (CRUD Produk per Supplier).
* [ ] Create Store Settings (Toggle Buka/Tutup).

## Phase 3: Core Transaction Loop (The "Hybrid" Logic)
* [ ] **Feature: Night Input (Supplier)**
    * UI untuk input rencana setoran.
    * Logic validasi (blokir jika toko tutup).
* [ ] **Feature: Morning Validation (Admin)**
    * UI List Penyetor (Sort by input time).
    * Action: Swipe/Click to Approve (Move Draft -> Verified).
* [ ] **Feature: Return & Calculation (Admin)**
    * UI Input Sisa Barang.
    * Logic hitung `Sold = Actual - Return`.
    * Logic hitung Rupiah.

## Phase 4: Reporting & Notification
* [ ] Create Supplier Dashboard (View Daily Recap).
* [ ] Create Admin Recap (Total Daily Profit).
* [ ] Integrate WAHA API (Send WA on Register & Transaction Complete).

## Phase 5: Testing & Deployment
* [ ] Test flow "Libur Mendadak".
* [ ] Test flow "Lupa PIN".
* [ ] Deploy to VPS.
* [ ] User Training (Simulasi dengan 1-2 penyetor).