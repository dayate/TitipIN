/**
 * Database Seed Script
 *
 * Generates realistic dummy data for 30 days of transactions.
 * Run with: npx tsx src/lib/server/db/seed.ts
 *
 * @module db/seed
 */

import Database from 'better-sqlite3';
import bcrypt from 'bcrypt';
import { nanoid } from 'nanoid';

// Database connection - same path as drizzle.config.ts
const db = new Database('./data/database.db');

// Helper functions
function hashPin(pin: string): string {
	return bcrypt.hashSync(pin, 10);
}

function randomInt(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice<T>(arr: T[]): T {
	return arr[Math.floor(Math.random() * arr.length)];
}

function generateSlug(name: string): string {
	return (
		name
			.toLowerCase()
			.replace(/\s+/g, '-')
			.replace(/[^a-z0-9-]/g, '') +
		'-' +
		nanoid(6)
	);
}

function formatDate(date: Date): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
}

function getDateMinusDays(days: number): Date {
	const date = new Date();
	date.setDate(date.getDate() - days);
	return date;
}

// ============================================
// SEED DATA
// ============================================

const OWNERS = [
	{ name: 'Bu Yanti', whatsapp: '081234567890', pin: '123456' },
	{ name: 'Pak Budi', whatsapp: '081234567891', pin: '123456' }
];

const SUPPLIERS = [
	{ name: 'Mak Ijah', whatsapp: '082111222333', pin: '123456' },
	{ name: 'Bu Siti', whatsapp: '082111222334', pin: '123456' },
	{ name: 'Pak Udin', whatsapp: '082111222335', pin: '123456' },
	{ name: 'Mba Dewi', whatsapp: '082111222336', pin: '123456' },
	{ name: 'Pak Ahmad', whatsapp: '082111222337', pin: '123456' }
];

const STORES = [
	{ name: 'Lapak Jajan Bu Yanti', description: 'Jajan pasar dan kue tradisional' },
	{ name: 'Warung Pak Budi', description: 'Makanan ringan dan gorengan' }
];

const PRODUCTS = [
	// Bu Yanti's store products
	{ name: 'Kue Lapis', priceBuy: 2000, priceSell: 3000 },
	{ name: 'Onde-onde', priceBuy: 1500, priceSell: 2500 },
	{ name: 'Klepon', priceBuy: 1500, priceSell: 2500 },
	{ name: 'Lemper', priceBuy: 2500, priceSell: 4000 },
	{ name: 'Risoles', priceBuy: 3000, priceSell: 5000 },
	{ name: 'Pastel', priceBuy: 3000, priceSell: 5000 },
	{ name: 'Kue Putu', priceBuy: 2000, priceSell: 3500 },
	{ name: 'Serabi', priceBuy: 2000, priceSell: 3000 },
	{ name: 'Getuk', priceBuy: 1500, priceSell: 2500 },
	{ name: 'Nagasari', priceBuy: 2000, priceSell: 3500 },
	// Pak Budi's store products
	{ name: 'Bakwan', priceBuy: 1000, priceSell: 2000 },
	{ name: 'Tahu Isi', priceBuy: 1500, priceSell: 2500 },
	{ name: 'Tempe Goreng', priceBuy: 1000, priceSell: 2000 },
	{ name: 'Pisang Goreng', priceBuy: 1500, priceSell: 2500 },
	{ name: 'Cireng', priceBuy: 1000, priceSell: 2000 },
	{ name: 'Combro', priceBuy: 1500, priceSell: 2500 },
	{ name: 'Misro', priceBuy: 1500, priceSell: 2500 },
	{ name: 'Bala-bala', priceBuy: 1500, priceSell: 2500 },
	{ name: 'Martabak Mini', priceBuy: 2000, priceSell: 3500 },
	{ name: 'Pempek', priceBuy: 3000, priceSell: 5000 }
];

// ============================================
// SEED FUNCTIONS
// ============================================

function seedUsers(): { ownerIds: number[]; supplierIds: number[] } {
	console.log('📦 Seeding users...');

	const ownerIds: number[] = [];
	const supplierIds: number[] = [];

	// Create owners
	for (const owner of OWNERS) {
		const result = db
			.prepare(
				`
			INSERT INTO users (name, whatsapp, pin_hash, role, status, created_at)
			VALUES (?, ?, ?, 'owner', 'active', ?)
		`
			)
			.run(owner.name, owner.whatsapp, hashPin(owner.pin), Date.now());
		ownerIds.push(result.lastInsertRowid as number);
	}

	// Create suppliers
	for (const supplier of SUPPLIERS) {
		const result = db
			.prepare(
				`
			INSERT INTO users (name, whatsapp, pin_hash, role, status, created_at)
			VALUES (?, ?, ?, 'supplier', 'active', ?)
		`
			)
			.run(supplier.name, supplier.whatsapp, hashPin(supplier.pin), Date.now());
		supplierIds.push(result.lastInsertRowid as number);
	}

	console.log(`   ✅ Created ${ownerIds.length} owners, ${supplierIds.length} suppliers`);
	return { ownerIds, supplierIds };
}

function seedStores(ownerIds: number[]): number[] {
	console.log('🏪 Seeding stores...');

	const storeIds: number[] = [];

	for (let i = 0; i < STORES.length; i++) {
		const store = STORES[i];
		const ownerId = ownerIds[i % ownerIds.length];

		const result = db
			.prepare(
				`
			INSERT INTO stores (owner_id, name, slug, description, visibility, is_open, auto_approve, operating_days, open_time, close_time, created_at, updated_at)
			VALUES (?, ?, ?, ?, 'public', 1, 1, 'Senin-Sabtu', '04:00', '10:00', ?, ?)
		`
			)
			.run(
				ownerId,
				store.name,
				generateSlug(store.name),
				store.description,
				Date.now(),
				Date.now()
			);
		storeIds.push(result.lastInsertRowid as number);
	}

	console.log(`   ✅ Created ${storeIds.length} stores`);
	return storeIds;
}

function seedMembers(storeIds: number[], supplierIds: number[]): void {
	console.log('👥 Seeding store members...');

	let memberCount = 0;

	// Distribute suppliers across stores
	for (let i = 0; i < supplierIds.length; i++) {
		const storeId = storeIds[i % storeIds.length];
		const supplierId = supplierIds[i];

		db.prepare(
			`
			INSERT INTO store_members (store_id, user_id, status, role, joined_at, created_at)
			VALUES (?, ?, 'active', 'member', ?, ?)
		`
		).run(storeId, supplierId, Date.now(), Date.now());
		memberCount++;
	}

	// Some suppliers join multiple stores
	db.prepare(
		`
		INSERT INTO store_members (store_id, user_id, status, role, joined_at, created_at)
		VALUES (?, ?, 'active', 'member', ?, ?)
	`
	).run(storeIds[1], supplierIds[0], Date.now(), Date.now());
	memberCount++;

	console.log(`   ✅ Created ${memberCount} store memberships`);
}

function seedProducts(storeIds: number[], supplierIds: number[]): Map<number, number[]> {
	console.log('🛒 Seeding products...');

	const storeProducts = new Map<number, number[]>();
	let productCount = 0;

	for (const storeId of storeIds) {
		storeProducts.set(storeId, []);
	}

	// Distribute products across stores and suppliers
	for (let i = 0; i < PRODUCTS.length; i++) {
		const product = PRODUCTS[i];
		const storeId = storeIds[i % storeIds.length];
		const supplierId = supplierIds[i % supplierIds.length];

		const result = db
			.prepare(
				`
			INSERT INTO products (supplier_id, store_id, name, price_buy, price_sell, status, is_active, created_at)
			VALUES (?, ?, ?, ?, ?, 'approved', 1, ?)
		`
			)
			.run(supplierId, storeId, product.name, product.priceBuy, product.priceSell, Date.now());

		storeProducts.get(storeId)?.push(result.lastInsertRowid as number);
		productCount++;
	}

	console.log(`   ✅ Created ${productCount} products`);
	return storeProducts;
}

function seedTransactions(
	storeIds: number[],
	supplierIds: number[],
	storeProducts: Map<number, number[]>
): void {
	console.log('📝 Seeding 30 days of transactions...');

	let transactionCount = 0;
	let itemCount = 0;

	// Generate transactions for last 30 days
	for (let dayOffset = 29; dayOffset >= 0; dayOffset--) {
		const date = getDateMinusDays(dayOffset);
		const dateStr = formatDate(date);
		const dayOfWeek = date.getDay();

		// Skip Sundays (store closed)
		if (dayOfWeek === 0) continue;

		for (const storeId of storeIds) {
			const products = storeProducts.get(storeId) || [];
			if (products.length === 0) continue;

			// Get suppliers for this store
			const storeSuppliers = db
				.prepare(
					`
				SELECT user_id FROM store_members
				WHERE store_id = ? AND status = 'active'
			`
				)
				.all(storeId) as { user_id: number }[];

			// Each active supplier creates 1 transaction per day
			for (const { user_id: supplierId } of storeSuppliers) {
				// Get products for this supplier in this store
				const supplierProducts = db
					.prepare(
						`
					SELECT id, price_buy FROM products
					WHERE store_id = ? AND supplier_id = ? AND is_active = 1
				`
					)
					.all(storeId, supplierId) as { id: number; price_buy: number }[];

				if (supplierProducts.length === 0) continue;

				// Randomize transaction status based on date
				let status: string;
				if (dayOffset === 0) {
					status = randomChoice(['draft', 'verified', 'completed']);
				} else if (dayOffset <= 2) {
					status = randomChoice(['verified', 'completed', 'completed']);
				} else {
					status = randomChoice(['completed', 'completed', 'completed', 'cancelled']);
				}

				// Calculate totals
				let totalItemsIn = 0;
				let totalItemsSold = 0;
				let totalPayout = 0;
				const items: {
					productId: number;
					qtyPlanned: number;
					qtyActual: number;
					qtyReturned: number;
					priceBuy: number;
				}[] = [];

				for (const product of supplierProducts) {
					const qtyPlanned = randomInt(5, 20);
					const qtyActual = status === 'draft' ? 0 : Math.max(0, qtyPlanned + randomInt(-2, 2));
					const qtyReturned =
						status === 'completed' ? randomInt(0, Math.floor(qtyActual * 0.3)) : 0;
					const qtySold = qtyActual - qtyReturned;

					items.push({
						productId: product.id,
						qtyPlanned,
						qtyActual,
						qtyReturned,
						priceBuy: product.price_buy
					});

					totalItemsIn += qtyActual;
					totalItemsSold += qtySold;
					totalPayout += qtySold * product.price_buy;
				}

				// Insert transaction
				const trxResult = db
					.prepare(
						`
					INSERT INTO daily_transactions (date, store_id, supplier_id, status, total_items_in, total_items_sold, total_payout, created_at)
					VALUES (?, ?, ?, ?, ?, ?, ?, ?)
				`
					)
					.run(
						dateStr,
						storeId,
						supplierId,
						status,
						totalItemsIn,
						totalItemsSold,
						totalPayout,
						date.getTime()
					);

				const trxId = trxResult.lastInsertRowid as number;
				transactionCount++;

				// Insert transaction items
				for (const item of items) {
					db.prepare(
						`
						INSERT INTO transaction_items (trx_id, product_id, qty_planned, qty_actual, qty_returned)
						VALUES (?, ?, ?, ?, ?)
					`
					).run(trxId, item.productId, item.qtyPlanned, item.qtyActual, item.qtyReturned);
					itemCount++;
				}
			}
		}
	}

	console.log(`   ✅ Created ${transactionCount} transactions with ${itemCount} items`);
}

function seedAuditLogs(storeIds: number[], ownerIds: number[]): void {
	console.log('📋 Seeding audit logs...');

	let logCount = 0;

	// Get some transaction IDs
	const transactions = db
		.prepare(
			`
		SELECT id FROM daily_transactions LIMIT 20
	`
		)
		.all() as { id: number }[];

	const actions = ['transaction_created', 'transaction_verified', 'transaction_completed'];

	for (const trx of transactions) {
		const action = randomChoice(actions);
		db.prepare(
			`
			INSERT INTO audit_logs (entity_type, entity_id, action, actor_id, created_at)
			VALUES ('transaction', ?, ?, ?, ?)
		`
		).run(
			trx.id,
			action,
			randomChoice(ownerIds),
			Date.now() - randomInt(0, 30 * 24 * 60 * 60 * 1000)
		);
		logCount++;
	}

	console.log(`   ✅ Created ${logCount} audit logs`);
}

function seedSupplierStats(storeIds: number[], supplierIds: number[]): void {
	console.log('📊 Seeding supplier stats...');

	let statsCount = 0;

	for (const storeId of storeIds) {
		for (const supplierId of supplierIds) {
			// Check if this supplier is a member of this store
			const isMember = db
				.prepare(
					`
				SELECT 1 FROM store_members WHERE store_id = ? AND user_id = ? AND status = 'active'
			`
				)
				.get(storeId, supplierId);

			if (!isMember) continue;

			// Calculate stats from actual transactions
			const stats = db
				.prepare(
					`
				SELECT
					COUNT(*) as total_transactions,
					SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
					SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled,
					SUM(total_items_in) as total_in,
					SUM(total_items_sold) as total_sold,
					SUM(total_payout) as total_revenue
				FROM daily_transactions
				WHERE store_id = ? AND supplier_id = ?
			`
				)
				.get(storeId, supplierId) as {
				total_transactions: number;
				completed: number;
				cancelled: number;
				total_in: number;
				total_sold: number;
				total_revenue: number;
			};

			const reliability =
				stats.total_transactions > 0
					? Math.round((stats.completed / stats.total_transactions) * 100)
					: 100;

			db.prepare(
				`
				INSERT INTO supplier_stats (supplier_id, store_id, total_transactions, completed_transactions, cancelled_by_supplier, total_planned_qty, total_actual_qty, total_sold_qty, total_revenue, reliability_score, created_at, updated_at)
				VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
			`
			).run(
				supplierId,
				storeId,
				stats.total_transactions || 0,
				stats.completed || 0,
				stats.cancelled || 0,
				stats.total_in || 0,
				stats.total_in || 0,
				stats.total_sold || 0,
				stats.total_revenue || 0,
				reliability,
				Date.now(),
				Date.now()
			);
			statsCount++;
		}
	}

	console.log(`   ✅ Created ${statsCount} supplier stats`);
}

function seedNotifications(supplierIds: number[], ownerIds: number[]): void {
	console.log('🔔 Seeding notifications...');

	let notifCount = 0;

	const messages = [
		{
			type: 'join_approved',
			title: 'Bergabung Disetujui',
			message: 'Selamat! Permintaan Anda untuk bergabung telah disetujui.'
		},
		{
			type: 'transaction_verified',
			title: 'Setoran Diverifikasi',
			message: 'Setoran hari ini telah diverifikasi oleh admin.'
		},
		{
			type: 'transaction_completed',
			title: 'Transaksi Selesai',
			message: 'Transaksi hari ini telah selesai. Silakan cek riwayat.'
		},
		{ type: 'info', title: 'Pengumuman', message: 'Besok lapak tutup karena hari libur.' }
	];

	// Notifications for suppliers
	for (const supplierId of supplierIds) {
		const notifData = randomChoice(messages);
		db.prepare(
			`
			INSERT INTO notifications (user_id, type, title, message, is_read, created_at)
			VALUES (?, ?, ?, ?, ?, ?)
		`
		).run(
			supplierId,
			notifData.type,
			notifData.title,
			notifData.message,
			randomChoice([0, 1]),
			Date.now() - randomInt(0, 7 * 24 * 60 * 60 * 1000)
		);
		notifCount++;
	}

	// Notifications for owners
	for (const ownerId of ownerIds) {
		db.prepare(
			`
			INSERT INTO notifications (user_id, type, title, message, is_read, created_at)
			VALUES (?, 'join_request', 'Permintaan Bergabung', 'Ada permintaan baru untuk bergabung ke lapak Anda.', 0, ?)
		`
		).run(ownerId, Date.now() - randomInt(0, 3 * 24 * 60 * 60 * 1000));
		notifCount++;
	}

	console.log(`   ✅ Created ${notifCount} notifications`);
}

// ============================================
// MAIN
// ============================================

function clearDatabase(): void {
	console.log('🗑️  Clearing existing data...');

	const tables = [
		'notifications',
		'supplier_stats',
		'audit_logs',
		'transaction_items',
		'daily_transactions',
		'products',
		'store_members',
		'store_invites',
		'stores',
		'sessions',
		'users'
	];

	for (const table of tables) {
		try {
			db.prepare(`DELETE FROM ${table}`).run();
		} catch {
			// Table might not exist
		}
	}

	console.log('   ✅ Database cleared');
}

function main(): void {
	console.log('\n🌱 Starting database seed...\n');

	try {
		// Clear existing data
		clearDatabase();

		// Seed data in order
		const { ownerIds, supplierIds } = seedUsers();
		const storeIds = seedStores(ownerIds);
		seedMembers(storeIds, supplierIds);
		const storeProducts = seedProducts(storeIds, supplierIds);
		seedTransactions(storeIds, supplierIds, storeProducts);
		seedAuditLogs(storeIds, ownerIds);
		seedSupplierStats(storeIds, supplierIds);
		seedNotifications(supplierIds, ownerIds);

		console.log('\n✅ Seed completed successfully!\n');
		console.log('📋 Test Accounts:');
		console.log('   Owner: 081234567890 / PIN: 123456');
		console.log('   Supplier: 082111222333 / PIN: 123456');
		console.log('');
	} catch (error) {
		console.error('❌ Seed failed:', error);
		process.exit(1);
	} finally {
		db.close();
	}
}

main();
