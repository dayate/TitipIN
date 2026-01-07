/**
 * Audit Log System
 *
 * Provides functions to log all significant changes for audit trail.
 * Stores old/new values as JSON for complete change tracking.
 */

import { db } from './db';
import { auditLogs, type AuditAction } from './db/schema';

export interface AuditLogParams {
	entityType: 'transaction' | 'product' | 'member' | 'store';
	entityId: number;
	action: AuditAction;
	actorId: number;
	oldValue?: object | null;
	newValue?: object | null;
	reason?: string;
	ipAddress?: string;
}

/**
 * Log an audit event to the database
 */
export async function logAudit(params: AuditLogParams): Promise<void> {
	try {
		await db.insert(auditLogs).values({
			entityType: params.entityType,
			entityId: params.entityId,
			action: params.action,
			actorId: params.actorId,
			oldValue: params.oldValue ? JSON.stringify(params.oldValue) : null,
			newValue: params.newValue ? JSON.stringify(params.newValue) : null,
			reason: params.reason,
			ipAddress: params.ipAddress
		});
	} catch (error) {
		// Log but don't throw - audit should not break main operations
		console.error('[Audit] Failed to log audit:', error);
	}
}

/**
 * Convenience function for transaction audit
 */
export async function logTransactionAudit(
	transactionId: number,
	action: Extract<
		AuditAction,
		| 'transaction_created'
		| 'transaction_verified'
		| 'transaction_completed'
		| 'transaction_cancelled'
		| 'qty_adjusted'
		| 'item_added'
		| 'item_removed'
	>,
	actorId: number,
	oldValue?: object | null,
	newValue?: object | null,
	reason?: string
): Promise<void> {
	return logAudit({
		entityType: 'transaction',
		entityId: transactionId,
		action,
		actorId,
		oldValue,
		newValue,
		reason
	});
}

/**
 * Convenience function for product audit
 */
export async function logProductAudit(
	productId: number,
	action: Extract<AuditAction, 'product_approved' | 'product_rejected'>,
	actorId: number,
	oldValue?: object | null,
	newValue?: object | null,
	reason?: string
): Promise<void> {
	return logAudit({
		entityType: 'product',
		entityId: productId,
		action,
		actorId,
		oldValue,
		newValue,
		reason
	});
}

/**
 * Convenience function for member audit
 */
export async function logMemberAudit(
	memberId: number,
	action: Extract<AuditAction, 'member_promoted' | 'member_demoted'>,
	actorId: number,
	oldValue?: object | null,
	newValue?: object | null
): Promise<void> {
	return logAudit({
		entityType: 'member',
		entityId: memberId,
		action,
		actorId,
		oldValue,
		newValue
	});
}

/**
 * Convenience function for store audit
 */
export async function logStoreAudit(
	storeId: number,
	action: Extract<AuditAction, 'store_status_changed'>,
	actorId: number,
	oldValue?: object | null,
	newValue?: object | null,
	reason?: string
): Promise<void> {
	return logAudit({
		entityType: 'store',
		entityId: storeId,
		action,
		actorId,
		oldValue,
		newValue,
		reason
	});
}

/**
 * Get audit logs for an entity
 */
export async function getAuditLogs(entityType: string, entityId: number, limit = 50) {
	const { eq, and, desc } = await import('drizzle-orm');

	return db
		.select()
		.from(auditLogs)
		.where(and(eq(auditLogs.entityType, entityType), eq(auditLogs.entityId, entityId)))
		.orderBy(desc(auditLogs.createdAt))
		.limit(limit);
}

/**
 * Get recent audit logs for a store (all entities)
 */
export async function getStoreAuditLogs(storeId: number, limit = 100) {
	const { eq, or, desc } = await import('drizzle-orm');

	// Get all transaction audits related to store
	// Note: This is a simplified version, in production you'd join with transactions table
	return db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(limit);
}
