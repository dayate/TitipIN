import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// ============================================
// ENUMS (as string unions in TypeScript)
// ============================================
export type UserRole = 'owner' | 'supplier';
export type UserStatus = 'pending' | 'active' | 'suspended';
export type MemberStatus = 'pending' | 'active' | 'suspended' | 'rejected' | 'leaving';
export type MemberRole = 'member' | 'admin';
export type ProductStatus = 'pending' | 'approved' | 'rejected';
export type TransactionStatus = 'draft' | 'verified' | 'completed' | 'cancelled';
export type StoreVisibility = 'public' | 'private';

// Audit action types for tracking changes
export type AuditAction =
	| 'transaction_created'
	| 'transaction_verified'
	| 'transaction_completed'
	| 'transaction_cancelled'
	| 'qty_adjusted'
	| 'item_added'
	| 'item_removed'
	| 'member_promoted'
	| 'member_demoted'
	| 'store_status_changed'
	| 'product_approved'
	| 'product_rejected';

// ============================================
// TABLES
// ============================================

// 1. Users
export const users = sqliteTable('users', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull(),
	whatsapp: text('whatsapp').notNull().unique(),
	pinHash: text('pin_hash').notNull(),
	role: text('role').$type<UserRole>().notNull().default('supplier'),
	status: text('status').$type<UserStatus>().notNull().default('active'),
	avatarUrl: text('avatar_url'),
	bio: text('bio'),
	address: text('address'),
	createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
});

// 2. Sessions
export const sessions = sqliteTable('sessions', {
	id: text('id').primaryKey(),
	userId: integer('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull()
});

// 3. Stores
export const stores = sqliteTable('stores', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	ownerId: integer('owner_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	name: text('name').notNull(),
	slug: text('slug').notNull().unique(),
	description: text('description'),
	logoUrl: text('logo_url'),
	bannerUrl: text('banner_url'),
	// Contact Info
	phone: text('phone'),
	address: text('address'),
	// Settings
	visibility: text('visibility').$type<StoreVisibility>().notNull().default('private'),
	isOpen: integer('is_open', { mode: 'boolean' }).notNull().default(true),
	autoApprove: integer('auto_approve', { mode: 'boolean' }).notNull().default(true),
	// Operating Hours
	operatingDays: text('operating_days').default('Senin-Sabtu'), // e.g., "Senin-Sabtu"
	openTime: text('open_time').default('04:00'),
	closeTime: text('close_time').default('08:00'),
	emergencyMode: integer('emergency_mode', { mode: 'boolean' }).notNull().default(false),
	announcement: text('announcement'),
	// Cut-off Settings
	cutoffTime: text('cutoff_time').default('11:00'), // Batas waktu input draft
	autoCancelEnabled: integer('auto_cancel_enabled', { mode: 'boolean' }).notNull().default(true),
	cutoffGracePeriod: integer('cutoff_grace_period').notNull().default(30), // Menit toleransi
	createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
});

// 4. Store Invites (Unique invite codes with expiration)
export const storeInvites = sqliteTable('store_invites', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	storeId: integer('store_id')
		.notNull()
		.references(() => stores.id, { onDelete: 'cascade' }),
	code: text('code').notNull().unique(),
	createdBy: integer('created_by')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
	maxUses: integer('max_uses').default(0), // 0 = unlimited
	usedCount: integer('used_count').notNull().default(0),
	isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
	createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
});

// 5. Store Branches
export const storeBranches = sqliteTable('store_branches', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	storeId: integer('store_id')
		.notNull()
		.references(() => stores.id, { onDelete: 'cascade' }),
	name: text('name').notNull(),
	address: text('address').notNull(),
	phone: text('phone'),
	latitude: integer('latitude'),
	longitude: integer('longitude'),
	isMain: integer('is_main', { mode: 'boolean' }).notNull().default(false),
	isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
	createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
});

// 6. Store Members

export const storeMembers = sqliteTable('store_members', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	storeId: integer('store_id')
		.notNull()
		.references(() => stores.id, { onDelete: 'cascade' }),
	userId: integer('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	status: text('status').$type<MemberStatus>().notNull().default('pending'),
	role: text('role').$type<MemberRole>().notNull().default('member'), // [NEW] Admin role
	invitedBy: integer('invited_by').references(() => users.id),
	inviteCodeUsed: text('invite_code_used'),
	requestMessage: text('request_message'),
	rejectionReason: text('rejection_reason'),
	rejectedAt: integer('rejected_at', { mode: 'timestamp' }), // For cooldown period
	leaveReason: text('leave_reason'), // Reason for leaving
	leaveRequestedAt: integer('leave_requested_at', { mode: 'timestamp' }), // When user requested to leave
	joinedAt: integer('joined_at', { mode: 'timestamp' }),
	createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
});

// 7. Products
export const products = sqliteTable('products', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	supplierId: integer('supplier_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	storeId: integer('store_id')
		.notNull()
		.references(() => stores.id, { onDelete: 'cascade' }),
	name: text('name').notNull(),
	description: text('description'),
	imageUrl: text('image_url'),
	priceBuy: integer('price_buy').notNull(),
	priceSell: integer('price_sell').notNull(),
	suggestedPriceSell: integer('suggested_price_sell'), // Rekomendasi harga jual dari penyetor
	status: text('status').$type<ProductStatus>().notNull().default('pending'),
	isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
	createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
});

// 8. Daily Transactions
export const dailyTransactions = sqliteTable('daily_transactions', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	date: text('date').notNull(), // YYYY-MM-DD
	storeId: integer('store_id')
		.notNull()
		.references(() => stores.id, { onDelete: 'cascade' }),
	branchId: integer('branch_id').references(() => storeBranches.id),
	supplierId: integer('supplier_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	status: text('status').$type<TransactionStatus>().notNull().default('draft'),
	totalItemsIn: integer('total_items_in').notNull().default(0),
	totalItemsSold: integer('total_items_sold').notNull().default(0),
	totalPayout: integer('total_payout').notNull().default(0),
	adminNote: text('admin_note'),
	notePhotoUrl: text('note_photo_url'), // [NEW] Foto nota fisik
	createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
});

// 9. Transaction Items
export const transactionItems = sqliteTable('transaction_items', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	trxId: integer('trx_id')
		.notNull()
		.references(() => dailyTransactions.id, { onDelete: 'cascade' }),
	productId: integer('product_id')
		.notNull()
		.references(() => products.id, { onDelete: 'cascade' }),
	qtyPlanned: integer('qty_planned').notNull().default(0),
	qtyActual: integer('qty_actual').notNull().default(0),
	qtyReturned: integer('qty_returned').notNull().default(0)
});

// 10. Notifications
export type NotificationType =
	| 'join_request'           // Admin: ada user request join
	| 'join_approved'          // User: request disetujui
	| 'join_rejected'          // User: request ditolak
	| 'member_kicked'          // User: dikeluarkan dari lapak
	| 'leave_request'          // [NEW] Admin: ada user request keluar
	| 'leave_approved'         // [NEW] User: request keluar disetujui
	| 'product_approved'       // [NEW] User: produk disetujui
	| 'product_rejected'       // [NEW] User: produk ditolak
	| 'transaction_verified'   // [NEW] User: transaksi diverifikasi
	| 'transaction_completed'  // [NEW] User: transaksi selesai
	| 'transaction_cancelled'  // [NEW] User: transaksi dibatalkan
	| 'store_closed'           // [NEW] User: lapak tutup mendadak
	| 'cutoff_warning'         // [NEW] User: peringatan mendekati cutoff
	| 'info'                   // General info
	| 'system';                // System notification

export const notifications = sqliteTable('notifications', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	userId: integer('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	type: text('type').$type<NotificationType>().notNull().default('info'),
	title: text('title').notNull(),
	message: text('message').notNull(),
	detailUrl: text('detail_url'),  // Link ke halaman terkait
	relatedStoreId: integer('related_store_id').references(() => stores.id, { onDelete: 'set null' }),
	relatedMemberId: integer('related_member_id'),
	isRead: integer('is_read', { mode: 'boolean' }).notNull().default(false),
	createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
});

// 10. Audit Logs
export const auditLogs = sqliteTable('audit_logs', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	entityType: text('entity_type').notNull(), // 'transaction', 'product', 'member', 'store'
	entityId: integer('entity_id').notNull(),
	action: text('action').$type<AuditAction>().notNull(),
	actorId: integer('actor_id').references(() => users.id, { onDelete: 'set null' }),
	oldValue: text('old_value'), // JSON string
	newValue: text('new_value'), // JSON string
	reason: text('reason'),
	ipAddress: text('ip_address'),
	createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
});

// 11. Daily Store Status (History)
export const dailyStoreStatus = sqliteTable('daily_store_status', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	storeId: integer('store_id').notNull().references(() => stores.id, { onDelete: 'cascade' }),
	date: text('date').notNull(), // YYYY-MM-DD
	wasOpen: integer('was_open', { mode: 'boolean' }).notNull(),
	openedAt: integer('opened_at', { mode: 'timestamp' }),
	closedAt: integer('closed_at', { mode: 'timestamp' }),
	emergencyClose: integer('emergency_close', { mode: 'boolean' }).default(false),
	emergencyReason: text('emergency_reason'),
	createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
});

// 12. Rate Limits (Persistent)
export const rateLimits = sqliteTable('rate_limits', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	key: text('key').notNull().unique(),
	count: integer('count').notNull().default(0),
	resetTime: integer('reset_time', { mode: 'timestamp' }).notNull()
});

// 13. Supplier Stats (Reliability Tracking)
export const supplierStats = sqliteTable('supplier_stats', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	supplierId: integer('supplier_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
	storeId: integer('store_id').notNull().references(() => stores.id, { onDelete: 'cascade' }),
	totalTransactions: integer('total_transactions').notNull().default(0),
	completedTransactions: integer('completed_transactions').notNull().default(0),
	cancelledBySupplier: integer('cancelled_by_supplier').notNull().default(0),
	noShowCount: integer('no_show_count').notNull().default(0),
	totalPlannedQty: integer('total_planned_qty').notNull().default(0),
	totalActualQty: integer('total_actual_qty').notNull().default(0),
	totalSoldQty: integer('total_sold_qty').notNull().default(0),
	totalRevenue: integer('total_revenue').notNull().default(0),
	averageAccuracy: integer('avg_accuracy').notNull().default(100), // Percentage 0-100
	reliabilityScore: integer('reliability_score').notNull().default(100), // Percentage 0-100
	lastTransactionAt: integer('last_transaction_at', { mode: 'timestamp' }),
	createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
});

// Type exports for use in other files
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type Store = typeof stores.$inferSelect;
export type NewStore = typeof stores.$inferInsert;
export type StoreInvite = typeof storeInvites.$inferSelect;
export type NewStoreInvite = typeof storeInvites.$inferInsert;
export type StoreMember = typeof storeMembers.$inferSelect;
export type NewStoreMember = typeof storeMembers.$inferInsert;
export type Product = typeof products.$inferSelect;
export type DailyTransaction = typeof dailyTransactions.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;
export type DailyStoreStatus = typeof dailyStoreStatus.$inferSelect;
export type RateLimit = typeof rateLimits.$inferSelect;
export type SupplierStats = typeof supplierStats.$inferSelect;
