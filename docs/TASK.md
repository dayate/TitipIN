# Task List - Multi-Lapak Implementation

## Fase 1: Database Migration
- [ ] Update `schema.ts` dengan tabel baru
  - [ ] Modifikasi tabel `users` (tambah avatar, bio, address)
  - [ ] Buat tabel `stores`
  - [ ] Buat tabel `store_branches`
  - [ ] Buat tabel `store_members`
  - [ ] Modifikasi tabel `products` (tambah store_id, image_url)
  - [ ] Modifikasi tabel `daily_transactions` (tambah store_id, branch_id)
  - [ ] Buat tabel `global_posts` & `global_comments`
  - [ ] Buat tabel `local_posts` & `local_comments`
- [ ] Jalankan migration `npm run db:push`
- [ ] Hapus tabel lama `store_settings`

## Fase 2: Auth & Role System
- [ ] Update halaman register (pilihan role Owner/Supplier)
- [ ] Update middleware auth untuk cek role
- [ ] Buat guard untuk akses `/owner/*` (role=owner)
- [ ] Buat guard untuk akses `/app/*` (role=supplier)

## Fase 3: Store Management (Owner)
- [ ] API CRUD `/api/stores`
- [ ] Halaman buat lapak `/owner/create-store`
- [ ] Halaman kelola lapak `/owner/[storeId]`
- [ ] API CRUD cabang `/api/stores/[storeId]/branches`
- [ ] Halaman kelola cabang `/owner/[storeId]/branches`

## Fase 4: Membership System
- [ ] API join request `/api/stores/[storeId]/join`
- [ ] API manage members `/api/stores/[storeId]/members`
- [ ] Halaman explore lapak `/stores`
- [ ] Halaman detail & join `/stores/[slug]`
- [ ] Halaman kelola anggota `/owner/[storeId]/members`
- [ ] Halaman join requests `/owner/[storeId]/members/requests`
- [ ] Fitur invite via WhatsApp link

## Fase 5: Product Enhancement
- [ ] Implementasi file upload `/api/upload`
- [ ] Update form produk dengan upload foto
- [ ] Produk per-lapak `/app/[storeId]/products`
- [ ] Approve/reject produk `/owner/[storeId]/products`

## Fase 6: Transaction Flow (Per-Store)
- [ ] Refactor routes transaction dengan `[storeId]`
- [ ] Update input setoran `/app/[storeId]/setor`
- [ ] Update validasi `/owner/[storeId]/validation`
- [ ] Update input retur `/owner/[storeId]/return`
- [ ] Update riwayat `/app/[storeId]/history`
- [ ] Update laporan `/owner/[storeId]/reports`

## Fase 7: Community Feature
- [ ] API global posts `/api/community/global`
- [ ] API local posts `/api/community/local/[storeId]`
- [ ] Halaman komunitas global `/community`
- [ ] Halaman komunitas lapak `/app/[storeId]/community`
- [ ] Moderasi komunitas `/owner/[storeId]/community`

## Fase 8: User Profile
- [ ] API update profile `/api/users/profile`
- [ ] Halaman edit profile `/app/profile` & `/owner/profile`
- [ ] Upload avatar

## Fase 9: Polish & Testing
- [ ] Refactor layout dengan store switcher
- [ ] UI/UX consistency check
- [ ] Mobile responsive testing
- [ ] End-to-end testing manual
- [ ] Documentation update