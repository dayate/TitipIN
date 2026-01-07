/**
 * Notification Emitter Utility
 *
 * Enhanced SSE notification system using Node.js EventEmitter pattern
 * for better reliability and event handling.
 *
 * Features:
 * - Multi-connection support per user
 * - Automatic dead connection cleanup
 * - Broadcast to all users capability
 * - Connection statistics
 */

import { EventEmitter } from 'events';
import type { NotificationType } from './db/schema';
import { getUnreadCount, getNotifications } from './notifications';

// Type for SSE emit function
type EmitFunction = (event: string, data: string) => { error: boolean };

// Connection info for debugging
interface ConnectionInfo {
	emit: EmitFunction;
	connectedAt: Date;
	lastActivity: Date;
}

// Internal event emitter for pub/sub pattern
class NotificationHub extends EventEmitter {
	private connections = new Map<number, Map<EmitFunction, ConnectionInfo>>();
	private cleanupInterval: ReturnType<typeof setInterval> | null = null;

	constructor() {
		super();
		// Start periodic cleanup of stale connections
		this.startCleanupInterval();
	}

	/**
	 * Start periodic cleanup of stale connections (every 5 minutes)
	 */
	private startCleanupInterval() {
		this.cleanupInterval = setInterval(
			() => {
				this.cleanupStaleConnections();
			},
			5 * 60 * 1000
		);
	}

	/**
	 * Stop cleanup interval (for graceful shutdown)
	 */
	public stopCleanupInterval() {
		if (this.cleanupInterval) {
			clearInterval(this.cleanupInterval);
			this.cleanupInterval = null;
		}
	}

	/**
	 * Clean up connections that haven't had activity in 10 minutes
	 */
	private cleanupStaleConnections() {
		const staleThreshold = 10 * 60 * 1000; // 10 minutes
		const now = Date.now();

		for (const [userId, userConnections] of this.connections) {
			for (const [emit, info] of userConnections) {
				if (now - info.lastActivity.getTime() > staleThreshold) {
					userConnections.delete(emit);
					console.info(`[SSE] Cleaned up stale connection for user ${userId}`);
				}
			}

			if (userConnections.size === 0) {
				this.connections.delete(userId);
			}
		}
	}

	/**
	 * Register a new connection for a user
	 */
	public register(userId: number, emit: EmitFunction): void {
		if (!this.connections.has(userId)) {
			this.connections.set(userId, new Map());
		}

		const info: ConnectionInfo = {
			emit,
			connectedAt: new Date(),
			lastActivity: new Date()
		};

		this.connections.get(userId)!.set(emit, info);
		this.emit('connection', { userId, type: 'connect' });
	}

	/**
	 * Unregister a connection
	 */
	public unregister(userId: number, emit: EmitFunction): void {
		const userConnections = this.connections.get(userId);
		if (userConnections) {
			userConnections.delete(emit);
			if (userConnections.size === 0) {
				this.connections.delete(userId);
			}
			this.emit('connection', { userId, type: 'disconnect' });
		}
	}

	/**
	 * Check if user has active connections
	 */
	public hasConnections(userId: number): boolean {
		const connections = this.connections.get(userId);
		return connections !== undefined && connections.size > 0;
	}

	/**
	 * Get connection count for a user
	 */
	public getConnectionCount(userId: number): number {
		return this.connections.get(userId)?.size || 0;
	}

	/**
	 * Get total active connections across all users
	 */
	public getTotalConnections(): number {
		let total = 0;
		for (const userConnections of this.connections.values()) {
			total += userConnections.size;
		}
		return total;
	}

	/**
	 * Get connected user IDs
	 */
	public getConnectedUserIds(): number[] {
		return Array.from(this.connections.keys());
	}

	/**
	 * Send data to a specific user
	 */
	public sendToUser(userId: number, event: string, data: string): number {
		const userConnections = this.connections.get(userId);
		if (!userConnections || userConnections.size === 0) {
			return 0;
		}

		let successCount = 0;
		const toRemove: EmitFunction[] = [];

		for (const [emit, info] of userConnections) {
			const { error } = emit(event, data);
			if (error) {
				toRemove.push(emit);
			} else {
				info.lastActivity = new Date();
				successCount++;
			}
		}

		// Remove failed connections
		for (const emit of toRemove) {
			userConnections.delete(emit);
		}

		if (userConnections.size === 0) {
			this.connections.delete(userId);
		}

		return successCount;
	}

	/**
	 * Broadcast to all connected users
	 */
	public broadcast(event: string, data: string): number {
		let totalSent = 0;
		for (const userId of this.connections.keys()) {
			totalSent += this.sendToUser(userId, event, data);
		}
		return totalSent;
	}

	/**
	 * Get connection stats for debugging
	 */
	public getStats(): {
		totalUsers: number;
		totalConnections: number;
		userConnections: Record<number, number>;
	} {
		const userConnections: Record<number, number> = {};
		for (const [userId, connections] of this.connections) {
			userConnections[userId] = connections.size;
		}

		return {
			totalUsers: this.connections.size,
			totalConnections: this.getTotalConnections(),
			userConnections
		};
	}
}

// Singleton instance
const hub = new NotificationHub();

// ============================================
// PUBLIC API
// ============================================

/**
 * Register emitter untuk user
 */
export function registerConnection(
	userId: number,
	emit: (event: string, data: string) => { error: boolean }
) {
	hub.register(userId, emit);
}

/**
 * Unregister emitter untuk user
 */
export function unregisterConnection(
	userId: number,
	emit: (event: string, data: string) => { error: boolean }
) {
	hub.unregister(userId, emit);
}

/**
 * Check if user has active connections
 */
export function hasActiveConnections(userId: number): boolean {
	return hub.hasConnections(userId);
}

/**
 * Emit notifikasi update ke user tertentu
 * Dipanggil saat ada notifikasi baru dibuat
 */
export async function emitNotificationUpdate(userId: number) {
	if (!hub.hasConnections(userId)) {
		return; // No active connections for this user
	}

	try {
		const unreadCount = await getUnreadCount(userId);
		const notifications = await getNotifications(userId, { limit: 10 });

		const payload = JSON.stringify({
			unreadCount,
			notifications
		});

		hub.sendToUser(userId, 'notification', payload);
	} catch (error) {
		console.error('[SSE] Error emitting notification update:', error);
	}
}

/**
 * Broadcast system notification to all connected users
 */
export async function broadcastSystemNotification(message: string) {
	const payload = JSON.stringify({
		type: 'system',
		message,
		timestamp: new Date().toISOString()
	});

	const sent = hub.broadcast('system', payload);
	console.info(`[SSE] Broadcasted system notification to ${sent} connections`);
	return sent;
}

/**
 * Get number of active connections for a user (for debugging)
 */
export function getConnectionCount(userId: number): number {
	return hub.getConnectionCount(userId);
}

/**
 * Get total connection stats (for debugging/monitoring)
 */
export function getConnectionStats() {
	return hub.getStats();
}

/**
 * Graceful shutdown - stop cleanup interval
 */
export function shutdown() {
	hub.stopCleanupInterval();
}
