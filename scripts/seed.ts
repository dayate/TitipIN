import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from '../src/lib/server/db/schema.js';
import bcrypt from 'bcrypt';

const sqlite = new Database('./data/local.db');
const db = drizzle(sqlite, { schema });

async function seed() {
  console.log('🌱 Seeding database with 7 days of data...\n');

  // Clear existing data
  console.log('Clearing existing data...');
  db.delete(schema.transactionItems).run();
  db.delete(schema.dailyTransactions).run();
  db.delete(schema.notifications).run();
  db.delete(schema.products).run();
  db.delete(schema.sessions).run();
  db.delete(schema.storeSettings).run();
  db.delete(schema.users).run();

  // Create Admin
  console.log('\nCreating admin user...');
  const adminPin = await bcrypt.hash('123456', 10);
  const adminResult = db.insert(schema.users).values({
    name: 'Admin Toko',
    whatsapp: '081234567890',
    pinHash: adminPin,
    role: 'admin',
    status: 'active',
  }).returning().all();
  const admin = adminResult[0];
  console.log(`  ✓ Admin: ${admin.name} (WA: ${admin.whatsapp}, PIN: 123456)`);

  // Create Suppliers
  console.log('\nCreating supplier users...');
  const supplierPin = await bcrypt.hash('111111', 10);

  const suppliers = [
    { name: 'Bu Sari', whatsapp: '081111111111' },
    { name: 'Pak Joko', whatsapp: '082222222222' },
    { name: 'Bu Dewi', whatsapp: '083333333333' },
    { name: 'Bu Ani', whatsapp: '084444444444' },
    { name: 'Pak Budi', whatsapp: '085555555555' },
  ];

  const createdSuppliers: any[] = [];
  for (const s of suppliers) {
    const result = db.insert(schema.users).values({
      name: s.name,
      whatsapp: s.whatsapp,
      pinHash: supplierPin,
      role: 'supplier',
      status: 'active',
    }).returning().all();
    const supplier = result[0];
    createdSuppliers.push(supplier);
    console.log(`  ✓ Supplier: ${supplier.name} (WA: ${supplier.whatsapp}, PIN: 111111)`);
  }

  // Create a pending user
  const pendingPin = await bcrypt.hash('111111', 10);
  db.insert(schema.users).values({
    name: 'Bu Rina (Pending)',
    whatsapp: '086666666666',
    pinHash: pendingPin,
    role: 'supplier',
    status: 'pending',
  }).run();
  console.log(`  ✓ Pending User: Bu Rina (WA: 086666666666)`);

  // Create Products
  console.log('\nCreating products...');
  const productsData = [
    // Bu Sari's products
    { supplierId: createdSuppliers[0].id, name: 'Kue Lapis', priceBuy: 3000, priceSell: 5000, status: 'approved' as const, isActive: true },
    { supplierId: createdSuppliers[0].id, name: 'Roti Goreng', priceBuy: 2000, priceSell: 3500, status: 'approved' as const, isActive: true },
    { supplierId: createdSuppliers[0].id, name: 'Onde-onde', priceBuy: 1500, priceSell: 2500, status: 'approved' as const, isActive: true },
    { supplierId: createdSuppliers[0].id, name: 'Klepon', priceBuy: 1500, priceSell: 2500, status: 'pending' as const, isActive: false },
    // Pak Joko's products
    { supplierId: createdSuppliers[1].id, name: 'Tempe Goreng', priceBuy: 1000, priceSell: 2000, status: 'approved' as const, isActive: true },
    { supplierId: createdSuppliers[1].id, name: 'Tahu Isi', priceBuy: 1500, priceSell: 2500, status: 'approved' as const, isActive: true },
    { supplierId: createdSuppliers[1].id, name: 'Pisang Goreng', priceBuy: 2000, priceSell: 3000, status: 'approved' as const, isActive: true },
    { supplierId: createdSuppliers[1].id, name: 'Bakwan', priceBuy: 1000, priceSell: 2000, status: 'approved' as const, isActive: true },
    // Bu Dewi's products
    { supplierId: createdSuppliers[2].id, name: 'Risoles', priceBuy: 2500, priceSell: 4000, status: 'approved' as const, isActive: true },
    { supplierId: createdSuppliers[2].id, name: 'Pastel', priceBuy: 2500, priceSell: 4000, status: 'approved' as const, isActive: true },
    { supplierId: createdSuppliers[2].id, name: 'Lumpia', priceBuy: 3000, priceSell: 5000, status: 'approved' as const, isActive: true },
    // Bu Ani's products
    { supplierId: createdSuppliers[3].id, name: 'Donat', priceBuy: 2000, priceSell: 3500, status: 'approved' as const, isActive: true },
    { supplierId: createdSuppliers[3].id, name: 'Roti Coklat', priceBuy: 2500, priceSell: 4000, status: 'approved' as const, isActive: true },
    { supplierId: createdSuppliers[3].id, name: 'Roti Keju', priceBuy: 3000, priceSell: 5000, status: 'approved' as const, isActive: true },
    // Pak Budi's products
    { supplierId: createdSuppliers[4].id, name: 'Molen', priceBuy: 2000, priceSell: 3500, status: 'approved' as const, isActive: true },
    { supplierId: createdSuppliers[4].id, name: 'Sosis Solo', priceBuy: 2500, priceSell: 4000, status: 'approved' as const, isActive: true },
    { supplierId: createdSuppliers[4].id, name: 'Kroket', priceBuy: 2500, priceSell: 4000, status: 'approved' as const, isActive: true },
  ];

  const createdProducts: any[] = [];
  for (const p of productsData) {
    const result = db.insert(schema.products).values(p).returning().all();
    createdProducts.push(result[0]);
    console.log(`  ✓ Product: ${p.name} (Rp ${p.priceBuy.toLocaleString()} -> Rp ${p.priceSell.toLocaleString()}) [${p.status}]`);
  }

  // Create Store Settings
  console.log('\nCreating store settings...');
  db.insert(schema.storeSettings).values({
    storeName: 'Mak Unyil',
    storeAddress: 'Jl. Pasar Minggu No. 123, Jakarta Selatan',
    storePhone: '081234567890',
    isOpen: true,
    openTime: '05:00',
    closeTime: '10:00',
    announcement: 'Selamat datang di Mak Unyil! Dapatkan diskon 10% untuk pembelian di atas 50rb. Toko buka setiap hari pukul 05:00 - 10:00 WIB.',
    emergencyMode: false,
  }).run();
  console.log('  ✓ Store settings created');

  // Create 7 days of transaction data
  console.log('\nCreating 7 days of transactions...');
  const today = new Date();

  for (let dayOffset = 6; dayOffset >= 0; dayOffset--) {
    const date = new Date(today);
    date.setDate(today.getDate() - dayOffset);
    const dateStr = date.toISOString().split('T')[0];

    console.log(`\n  📅 ${dateStr}:`);

    // Each supplier has transactions (vary by day)
    const activeSuppliers = dayOffset === 0
      ? createdSuppliers // All suppliers today
      : createdSuppliers.slice(0, 3 + Math.floor(Math.random() * 2)); // 3-4 suppliers other days

    for (const supplier of activeSuppliers) {
      // Get supplier's products
      const supplierProducts = createdProducts.filter(
        p => p.supplierId === supplier.id && p.status === 'approved' && p.isActive
      );

      if (supplierProducts.length === 0) continue;

      // Random quantities for items
      const itemsIn = supplierProducts.map(p => ({
        productId: p.id,
        productName: p.name,
        priceBuy: p.priceBuy,
        priceSell: p.priceSell,
        qtyPlanned: 5 + Math.floor(Math.random() * 20), // 5-24 items
        qtyActual: 0,
        qtyReturned: 0,
      }));

      // Set actual qty (usually same as planned)
      itemsIn.forEach(item => {
        item.qtyActual = item.qtyPlanned;
      });

      const totalItemsIn = itemsIn.reduce((sum, item) => sum + item.qtyActual, 0);

      // Determine status based on day
      let status: 'draft' | 'verified' | 'completed' = 'completed';
      if (dayOffset === 0) {
        // Today: mix of statuses
        const rand = Math.random();
        if (supplier.id === createdSuppliers[0].id) status = 'draft'; // First supplier still draft
        else if (supplier.id === createdSuppliers[1].id) status = 'verified'; // Second verified
        else status = 'completed';
      }

      // Calculate sold and payout for completed transactions
      let totalItemsSold = 0;
      let totalPayout = 0;

      if (status === 'completed') {
        itemsIn.forEach(item => {
          // 70-95% sold rate
          const soldRate = 0.7 + Math.random() * 0.25;
          const sold = Math.floor(item.qtyActual * soldRate);
          item.qtyReturned = item.qtyActual - sold;
          totalItemsSold += sold;
          totalPayout += sold * item.priceBuy;
        });
      }

      // Create transaction
      const txResult = db.insert(schema.dailyTransactions).values({
        supplierId: supplier.id,
        date: dateStr,
        status,
        totalItemsIn,
        totalItemsSold,
        totalPayout,
      }).returning().all();
      const tx = txResult[0];

      // Create transaction items
      for (const item of itemsIn) {
        db.insert(schema.transactionItems).values({
          trxId: tx.id,
          productId: item.productId,
          qtyPlanned: item.qtyPlanned,
          qtyActual: item.qtyActual,
          qtyReturned: item.qtyReturned,
        }).run();
      }

      const statusEmoji = status === 'completed' ? '✅' : status === 'verified' ? '📦' : '⏳';
      console.log(`    ${statusEmoji} ${supplier.name}: ${totalItemsIn} items, ${totalItemsSold} sold, Rp ${totalPayout.toLocaleString()}`);
    }
  }

  // Create sample notifications
  console.log('\nCreating sample notifications...');
  const notificationData = [
    { userId: createdSuppliers[0].id, type: 'info' as const, title: 'Pengumuman Toko', message: 'Toko akan tutup lebih awal besok jam 09:00 karena ada acara keluarga.', isRead: false },
    { userId: createdSuppliers[0].id, type: 'product_approved' as const, title: 'Produk Disetujui', message: 'Produk "Onde-onde" Anda telah disetujui oleh admin.', isRead: true },
    { userId: createdSuppliers[0].id, type: 'transaction' as const, title: 'Transaksi Selesai', message: 'Setoran hari ini sudah dihitung. Total bayar: Rp 45.000', isRead: true },
    { userId: createdSuppliers[1].id, type: 'info' as const, title: 'Pengumuman Toko', message: 'Toko akan tutup lebih awal besok jam 09:00 karena ada acara keluarga.', isRead: false },
    { userId: createdSuppliers[2].id, type: 'info' as const, title: 'Pengumuman Toko', message: 'Toko akan tutup lebih awal besok jam 09:00 karena ada acara keluarga.', isRead: false },
    { userId: createdSuppliers[2].id, type: 'warning' as const, title: 'Perhatian', message: 'Stok risoles Anda tinggal sedikit. Silakan tambah setoran.', isRead: false },
  ];

  for (const notif of notificationData) {
    db.insert(schema.notifications).values(notif).run();
  }
  console.log(`  ✓ Created ${notificationData.length} notifications`);

  console.log('\n' + '='.repeat(50));
  console.log('✅ Seeding complete!');
  console.log('='.repeat(50));
  console.log('\n📋 Login Credentials:');
  console.log('   Admin    : 081234567890 / 123456');
  console.log('   Bu Sari  : 081111111111 / 111111');
  console.log('   Pak Joko : 082222222222 / 111111');
  console.log('   Bu Dewi  : 083333333333 / 111111');
  console.log('   Bu Ani   : 084444444444 / 111111');
  console.log('   Pak Budi : 085555555555 / 111111');
  console.log('\n📊 Data Created:');
  console.log(`   - ${createdSuppliers.length} suppliers + 1 pending`);
  console.log(`   - ${createdProducts.length} products (1 pending)`);
  console.log('   - 7 days of transactions');
  console.log('   - Sample notifications');
}

seed().catch(console.error).finally(() => {
  sqlite.close();
});
