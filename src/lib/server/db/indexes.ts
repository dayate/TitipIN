/**
 * Database Indexes Configuration
 *
 * This file defines database indexes for performance optimization.
 * Indexes are created on frequently queried columns and composite
 * indexes for complex queries.
 *
 * @module db/indexes
 */

import { sql } from 'drizzle-orm';
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';

/**
 * Creates all performance-critical database indexes
 * @param db - The database instance
 */
export function createIndexes(db: BetterSQLite3Database): void {
	// === TRANSACTIONS INDEXES ===
	// Most queried table - needs multiple indexes

	// Composite index for filtering transactions by store, supplier, and date
	db.run(sql`
		CREATE INDEX IF NOT EXISTS idx_daily_transactions_store_date
		ON daily_transactions(store_id, date DESC)
	`);

	db.run(sql`
		CREATE INDEX IF NOT EXISTS idx_daily_transactions_supplier_date
		ON daily_transactions(supplier_id, date DESC)
	`);

	db.run(sql`
		CREATE INDEX IF NOT EXISTS idx_daily_transactions_status
		ON daily_transactions(status)
	`);

	db.run(sql`
		CREATE INDEX IF NOT EXISTS idx_daily_transactions_store_supplier_date
		ON daily_transactions(store_id, supplier_id, date DESC)
	`);

	// === TRANSACTION ITEMS INDEXES ===
	db.run(sql`
		CREATE INDEX IF NOT EXISTS idx_transaction_items_trx_id
		ON transaction_items(trx_id)
	`);

	db.run(sql`
		CREATE INDEX IF NOT EXISTS idx_transaction_items_product_id
		ON transaction_items(product_id)
	`);

	// === PRODUCTS INDEXES ===
	db.run(sql`
		CREATE INDEX IF NOT EXISTS idx_products_store_id
		ON products(store_id)
	`);

	db.run(sql`
		CREATE INDEX IF NOT EXISTS idx_products_supplier_id
		ON products(supplier_id)
	`);

	db.run(sql`
		CREATE INDEX IF NOT EXISTS idx_products_store_supplier
		ON products(store_id, supplier_id)
	`);

	db.run(sql`
		CREATE INDEX IF NOT EXISTS idx_products_status
		ON products(status)
	`);

	// === STORE MEMBERS INDEXES ===
	db.run(sql`
		CREATE INDEX IF NOT EXISTS idx_store_members_store_id
		ON store_members(store_id)
	`);

	db.run(sql`
		CREATE INDEX IF NOT EXISTS idx_store_members_user_id
		ON store_members(user_id)
	`);

	db.run(sql`
		CREATE INDEX IF NOT EXISTS idx_store_members_status
		ON store_members(status)
	`);

	db.run(sql`
		CREATE INDEX IF NOT EXISTS idx_store_members_store_user
		ON store_members(store_id, user_id)
	`);

	// === NOTIFICATIONS INDEXES ===
	db.run(sql`
		CREATE INDEX IF NOT EXISTS idx_notifications_user_id
		ON notifications(user_id)
	`);

	db.run(sql`
		CREATE INDEX IF NOT EXISTS idx_notifications_user_read
		ON notifications(user_id, is_read)
	`);

	db.run(sql`
		CREATE INDEX IF NOT EXISTS idx_notifications_created_at
		ON notifications(created_at DESC)
	`);

	// === AUDIT LOGS INDEXES ===
	db.run(sql`
		CREATE INDEX IF NOT EXISTS idx_audit_logs_entity
		ON audit_logs(entity_type, entity_id)
	`);

	db.run(sql`
		CREATE INDEX IF NOT EXISTS idx_audit_logs_actor
		ON audit_logs(actor_id)
	`);

	db.run(sql`
		CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at
		ON audit_logs(created_at DESC)
	`);

	// === SESSIONS INDEXES ===
	db.run(sql`
		CREATE INDEX IF NOT EXISTS idx_sessions_user_id
		ON sessions(user_id)
	`);

	db.run(sql`
		CREATE INDEX IF NOT EXISTS idx_sessions_expires_at
		ON sessions(expires_at)
	`);

	// === STORE INVITES INDEXES ===
	db.run(sql`
		CREATE INDEX IF NOT EXISTS idx_store_invites_store_id
		ON store_invites(store_id)
	`);

	// For code lookup during invite validation
	db.run(sql`
		CREATE INDEX IF NOT EXISTS idx_store_invites_code_active
		ON store_invites(code, is_active)
	`);

	// === SUPPLIER STATS INDEXES ===
	db.run(sql`
		CREATE INDEX IF NOT EXISTS idx_supplier_stats_supplier_store
		ON supplier_stats(supplier_id, store_id)
	`);

	db.run(sql`
		CREATE INDEX IF NOT EXISTS idx_supplier_stats_reliability
		ON supplier_stats(reliability_score DESC)
	`);

	// === DAILY STORE STATUS INDEXES ===
	db.run(sql`
		CREATE INDEX IF NOT EXISTS idx_daily_store_status_store_date
		ON daily_store_status(store_id, date DESC)
	`);

	// === RATE LIMITS INDEXES ===
	db.run(sql`
		CREATE INDEX IF NOT EXISTS idx_rate_limits_reset_time
		ON rate_limits(reset_time)
	`);
}

/**
 * Drops all custom indexes (useful for migrations)
 * @param db - The database instance
 */
export function dropIndexes(db: BetterSQLite3Database): void {
	const indexes = [
		'idx_daily_transactions_store_date',
		'idx_daily_transactions_supplier_date',
		'idx_daily_transactions_status',
		'idx_daily_transactions_store_supplier_date',
		'idx_transaction_items_trx_id',
		'idx_transaction_items_product_id',
		'idx_products_store_id',
		'idx_products_supplier_id',
		'idx_products_store_supplier',
		'idx_products_status',
		'idx_store_members_store_id',
		'idx_store_members_user_id',
		'idx_store_members_status',
		'idx_store_members_store_user',
		'idx_notifications_user_id',
		'idx_notifications_user_read',
		'idx_notifications_created_at',
		'idx_audit_logs_entity',
		'idx_audit_logs_actor',
		'idx_audit_logs_created_at',
		'idx_sessions_user_id',
		'idx_sessions_expires_at',
		'idx_store_invites_store_id',
		'idx_store_invites_code_active',
		'idx_supplier_stats_supplier_store',
		'idx_supplier_stats_reliability',
		'idx_daily_store_status_store_date',
		'idx_rate_limits_reset_time'
	];

	for (const idx of indexes) {
		db.run(sql.raw(`DROP INDEX IF EXISTS ${idx}`));
	}
}
