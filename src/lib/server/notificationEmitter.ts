/**
 * Notification Emitter Utility
 * Utility untuk mengirim notifikasi real-time ke user yang terhubung
 */

import type { NotificationType } from './db/schema';
import { getUnreadCount, getNotifications } from './notifications';

// Map untuk menyimpan emitter aktif per user
const activeConnections = new Map<number, Set<(event: string, data: string) => { error: boolean }>>();

/**
 * Register emitter untuk user
 */
export function registerConnection(
	userId: number,
	emit: (event: string, data: string) => { error: boolean }
) {
	if (!activeConnections.has(userId)) {
		activeConnections.set(userId, new Set());
	}
	activeConnections.get(userId)!.add(emit);
}

/**
 * Unregister emitter untuk user
 */
export function unregisterConnection(
	userId: number,
	emit: (event: string, data: string) => { error: boolean }
) {
	const userConnections = activeConnections.get(userId);
	if (userConnections) {
		userConnections.delete(emit);
		if (userConnections.size === 0) {
			activeConnections.delete(userId);
		}
	}
}

/**
 * Check if user has active connections
 */
export function hasActiveConnections(userId: number): boolean {
	const connections = activeConnections.get(userId);
	return connections !== undefined && connections.size > 0;
}

/**
 * Emit notifikasi update ke user tertentu
 * Dipanggil saat ada notifikasi baru dibuat
 */
export async function emitNotificationUpdate(userId: number) {
	const userConnections = activeConnections.get(userId);
	if (!userConnections || userConnections.size === 0) {
		return; // No active connections for this user
	}

	try {
		const unreadCount = await getUnreadCount(userId);
		const notifications = await getNotifications(userId, { limit: 10 });

		const payload = JSON.stringify({
			unreadCount,
			notifications
		});

		// Emit ke semua koneksi aktif user
		for (const emit of userConnections) {
			const { error } = emit('notification', payload);
			if (error) {
				// Connection closed, remove it
				userConnections.delete(emit);
			}
		}

		// Cleanup jika tidak ada koneksi tersisa
		if (userConnections.size === 0) {
			activeConnections.delete(userId);
		}
	} catch (error) {
		console.error('Error emitting notification update:', error);
	}
}

/**
 * Get number of active connections for a user (for debugging)
 */
export function getConnectionCount(userId: number): number {
	return activeConnections.get(userId)?.size || 0;
}
