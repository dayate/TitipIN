import { db } from './db';
import { notifications, users, stores, type NotificationType } from './db/schema';
import { eq, desc, and, sql } from 'drizzle-orm';

// Create a new notification
export async function createNotification(data: {
	userId: number;
	type: NotificationType;
	title: string;
	message: string;
	detailUrl?: string;
	relatedStoreId?: number;
	relatedMemberId?: number;
}) {
	const [notification] = await db
		.insert(notifications)
		.values({
			userId: data.userId,
			type: data.type,
			title: data.title,
			message: data.message,
			detailUrl: data.detailUrl || null,
			relatedStoreId: data.relatedStoreId || null,
			relatedMemberId: data.relatedMemberId || null,
			isRead: false
		})
		.returning();

	return notification;
}

// Get notifications for a user
export async function getNotifications(userId: number, options?: {
	limit?: number;
	offset?: number;
	unreadOnly?: boolean;
}) {
	const limit = options?.limit || 50;
	const offset = options?.offset || 0;

	let query = db
		.select()
		.from(notifications)
		.where(eq(notifications.userId, userId))
		.orderBy(desc(notifications.createdAt))
		.limit(limit)
		.offset(offset);

	const results = await query;

	if (options?.unreadOnly) {
		return results.filter(n => !n.isRead);
	}

	return results;
}

// Get unread count
export async function getUnreadCount(userId: number): Promise<number> {
	const result = await db
		.select({ count: sql<number>`count(*)` })
		.from(notifications)
		.where(and(
			eq(notifications.userId, userId),
			eq(notifications.isRead, false)
		));

	return result[0]?.count || 0;
}

// Mark notification as read
export async function markAsRead(notificationId: number) {
	const [updated] = await db
		.update(notifications)
		.set({ isRead: true })
		.where(eq(notifications.id, notificationId))
		.returning();

	return updated;
}

// Mark all as read for a user
export async function markAllAsRead(userId: number) {
	await db
		.update(notifications)
		.set({ isRead: true })
		.where(eq(notifications.userId, userId));

	return true;
}

// Delete notification
export async function deleteNotification(notificationId: number) {
	await db
		.delete(notifications)
		.where(eq(notifications.id, notificationId));

	return true;
}

// ============================================
// HELPER FUNCTIONS FOR INTEGRATION
// ============================================

// Notify store owner (helper)
export async function notifyStoreOwner(
	storeId: number,
	type: NotificationType,
	data: {
		title: string;
		message: string;
		detailUrl?: string;
		relatedMemberId?: number;
	}
) {
	// Get store owner
	const [store] = await db
		.select({ ownerId: stores.ownerId })
		.from(stores)
		.where(eq(stores.id, storeId))
		.limit(1);

	if (!store) return null;

	return createNotification({
		userId: store.ownerId,
		type,
		title: data.title,
		message: data.message,
		detailUrl: data.detailUrl,
		relatedStoreId: storeId,
		relatedMemberId: data.relatedMemberId
	});
}

// Notify user about join request status
export async function notifyJoinApproved(
	userId: number,
	storeName: string,
	storeId: number
) {
	return createNotification({
		userId,
		type: 'join_approved',
		title: 'Permintaan Disetujui! 🎉',
		message: `Selamat! Anda sekarang menjadi anggota ${storeName}. Anda bisa mulai menyetor produk.`,
		detailUrl: `/app/stores`,
		relatedStoreId: storeId
	});
}

export async function notifyJoinRejected(
	userId: number,
	storeName: string,
	storeId: number,
	reason?: string
) {
	let message = reason
		? `Permintaan bergabung ke ${storeName} ditolak. Alasan: ${reason}`
		: `Permintaan bergabung ke ${storeName} ditolak oleh pemilik lapak.`;

	// Add cooldown info
	message += ` Anda dapat mengajukan permintaan kembali setelah 7 hari, atau langsung bergabung dengan kode undangan.`;

	return createNotification({
		userId,
		type: 'join_rejected',
		title: 'Permintaan Ditolak',
		message,
		detailUrl: `/app/stores`,
		relatedStoreId: storeId
	});
}

export async function notifyMemberKicked(
	userId: number,
	storeName: string,
	storeId: number
) {
	return createNotification({
		userId,
		type: 'member_kicked',
		title: 'Anda Dikeluarkan',
		message: `Anda telah dikeluarkan dari lapak ${storeName}.`,
		detailUrl: `/app/stores`,
		relatedStoreId: storeId
	});
}

export async function notifyNewJoinRequest(
	storeId: number,
	userName: string,
	memberId: number
) {
	// Get store name
	const [store] = await db
		.select({ name: stores.name, ownerId: stores.ownerId })
		.from(stores)
		.where(eq(stores.id, storeId))
		.limit(1);

	if (!store) return null;

	return createNotification({
		userId: store.ownerId,
		type: 'join_request',
		title: 'Permintaan Bergabung Baru',
		message: `${userName} mengajukan permintaan untuk bergabung ke ${store.name}.`,
		detailUrl: `/admin/stores/${storeId}/members`,
		relatedStoreId: storeId,
		relatedMemberId: memberId
	});
}

export async function notifyLeaveRequest(
	storeId: number,
	userName: string,
	memberId: number,
	reason: string
) {
	// Get store name and owner
	const [store] = await db
		.select({ name: stores.name, ownerId: stores.ownerId })
		.from(stores)
		.where(eq(stores.id, storeId))
		.limit(1);

	if (!store) return null;

	return createNotification({
		userId: store.ownerId,
		type: 'info',
		title: 'Permintaan Keluar Lapak',
		message: `${userName} mengajukan permintaan keluar dari ${store.name}. Alasan: ${reason}`,
		detailUrl: `/admin/stores/${storeId}/members`,
		relatedStoreId: storeId,
		relatedMemberId: memberId
	});
}

