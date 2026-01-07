import { db } from './db';
import { notifications, users, stores, type NotificationType } from './db/schema';
import { eq, desc, and, sql } from 'drizzle-orm';
import { emitNotificationUpdate } from './notificationEmitter';

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

	// Emit notifikasi real-time ke client yang terhubung
	await emitNotificationUpdate(data.userId);

	return notification;
}

// Get notifications for a user
export async function getNotifications(
	userId: number,
	options?: {
		limit?: number;
		offset?: number;
		unreadOnly?: boolean;
	}
) {
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
		return results.filter((n) => !n.isRead);
	}

	return results;
}

// Get unread count
export async function getUnreadCount(userId: number): Promise<number> {
	const result = await db
		.select({ count: sql<number>`count(*)` })
		.from(notifications)
		.where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));

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
	await db.update(notifications).set({ isRead: true }).where(eq(notifications.userId, userId));

	return true;
}

// Delete notification
export async function deleteNotification(notificationId: number) {
	await db.delete(notifications).where(eq(notifications.id, notificationId));

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
export async function notifyJoinApproved(userId: number, storeName: string, storeId: number) {
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

export async function notifyMemberKicked(userId: number, storeName: string, storeId: number) {
	return createNotification({
		userId,
		type: 'member_kicked',
		title: 'Anda Dikeluarkan',
		message: `Anda telah dikeluarkan dari lapak ${storeName}.`,
		detailUrl: `/app/stores`,
		relatedStoreId: storeId
	});
}

export async function notifyNewJoinRequest(storeId: number, userName: string, memberId: number) {
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
		type: 'leave_request',
		title: 'Permintaan Keluar Lapak',
		message: `${userName} mengajukan permintaan keluar dari ${store.name}. Alasan: ${reason}`,
		detailUrl: `/admin/stores/${storeId}/members`,
		relatedStoreId: storeId,
		relatedMemberId: memberId
	});
}

// ============================================
// PRODUCT NOTIFICATIONS
// ============================================

export async function notifyProductApproved(
	userId: number,
	productName: string,
	storeName: string,
	storeId: number
) {
	return createNotification({
		userId,
		type: 'product_approved',
		title: 'Produk Disetujui! 🎉',
		message: `Produk "${productName}" telah disetujui oleh ${storeName}. Anda sekarang bisa mulai menyetor produk ini.`,
		detailUrl: `/app/${storeId}/products`,
		relatedStoreId: storeId
	});
}

export async function notifyProductRejected(
	userId: number,
	productName: string,
	storeName: string,
	storeId: number,
	reason?: string
) {
	const message = reason
		? `Produk "${productName}" ditolak oleh ${storeName}. Alasan: ${reason}`
		: `Produk "${productName}" ditolak oleh ${storeName}. Silakan hubungi pemilik lapak untuk informasi lebih lanjut.`;

	return createNotification({
		userId,
		type: 'product_rejected',
		title: 'Produk Ditolak',
		message,
		detailUrl: `/app/${storeId}/products`,
		relatedStoreId: storeId
	});
}

// ============================================
// TRANSACTION NOTIFICATIONS
// ============================================

export async function notifyTransactionVerified(
	userId: number,
	storeName: string,
	storeId: number,
	date: string,
	totalItems: number
) {
	return createNotification({
		userId,
		type: 'transaction_verified',
		title: 'Setoran Diverifikasi ✓',
		message: `Setoran Anda tanggal ${date} di ${storeName} (${totalItems} item) telah diverifikasi.`,
		detailUrl: `/app/${storeId}/history`,
		relatedStoreId: storeId
	});
}

export async function notifyTransactionCompleted(
	userId: number,
	storeName: string,
	storeId: number,
	date: string,
	totalSold: number,
	payout: number
) {
	const formattedPayout = new Intl.NumberFormat('id-ID', {
		style: 'currency',
		currency: 'IDR',
		minimumFractionDigits: 0
	}).format(payout);

	return createNotification({
		userId,
		type: 'transaction_completed',
		title: 'Transaksi Selesai 💰',
		message: `Transaksi tanggal ${date} di ${storeName} selesai! ${totalSold} item terjual, total payout: ${formattedPayout}`,
		detailUrl: `/app/${storeId}/history`,
		relatedStoreId: storeId
	});
}

// ============================================
// STORE NOTIFICATIONS
// ============================================

export async function notifyStoreClosed(storeId: number, storeName: string, reason?: string) {
	// Get all active members
	const { storeMembers } = await import('./db/schema');

	const members = await db
		.select({ userId: storeMembers.userId })
		.from(storeMembers)
		.where(and(eq(storeMembers.storeId, storeId), eq(storeMembers.status, 'active')));

	const message = reason
		? `Lapak ${storeName} tutup mendadak. Alasan: ${reason}`
		: `Lapak ${storeName} tutup mendadak hari ini. Silakan hubungi pemilik lapak untuk informasi lebih lanjut.`;

	// Create notification for each member
	const notifications = await Promise.all(
		members.map((m) =>
			createNotification({
				userId: m.userId,
				type: 'store_closed',
				title: 'Lapak Tutup ⚠️',
				message,
				detailUrl: `/app/${storeId}`,
				relatedStoreId: storeId
			})
		)
	);

	return notifications;
}

export async function notifyLeaveApproved(userId: number, storeName: string, storeId: number) {
	return createNotification({
		userId,
		type: 'leave_approved',
		title: 'Permintaan Keluar Disetujui',
		message: `Permintaan keluar Anda dari lapak ${storeName} telah disetujui. Terima kasih telah bergabung!`,
		detailUrl: `/app/stores`,
		relatedStoreId: storeId
	});
}
