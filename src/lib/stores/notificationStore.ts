/**
 * Notification SSE Store
 * Mengelola koneksi SSE untuk notifikasi real-time
 */

import { writable, derived, get } from 'svelte/store';
import { browser } from '$app/environment';

export interface Notification {
	id: number;
	userId: number;
	type: string;
	title: string;
	message: string;
	detailUrl: string | null;
	relatedStoreId: number | null;
	relatedMemberId: number | null;
	isRead: boolean;
	createdAt: string | null;
}

interface NotificationState {
	unreadCount: number;
	notifications: Notification[];
	connected: boolean;
	error: string | null;
}

function createNotificationStore() {
	const { subscribe, set, update } = writable<NotificationState>({
		unreadCount: 0,
		notifications: [],
		connected: false,
		error: null
	});

	let sourceConnection: { close: () => void } | null = null;
	let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;

	async function connect() {
		if (!browser) return;

		// Tutup koneksi sebelumnya jika ada
		disconnect();

		try {
			// Dynamic import sveltekit-sse untuk client-side only
			const { source } = await import('sveltekit-sse');

			const connection = source('/api/notifications/stream');
			sourceConnection = connection;

			// Subscribe ke event 'initial'
			const initialValue = connection.select('initial');
			initialValue.subscribe((value) => {
				if (value && value !== '') {
					try {
						const data = JSON.parse(value);
						update((state) => ({
							...state,
							unreadCount: data.unreadCount,
							notifications: data.notifications,
							connected: true,
							error: null
						}));
					} catch (e) {
						console.error('Error parsing initial data:', e);
					}
				}
			});

			// Subscribe ke event 'notification' untuk update real-time
			const notificationValue = connection.select('notification');
			notificationValue.subscribe((value) => {
				if (value && value !== '') {
					try {
						const data = JSON.parse(value);
						update((state) => ({
							...state,
							unreadCount: data.unreadCount,
							notifications: data.notifications
						}));
					} catch (e) {
						console.error('Error parsing notification:', e);
					}
				}
			});

			// Handle heartbeat untuk keep-alive
			const heartbeatValue = connection.select('heartbeat');
			heartbeatValue.subscribe(() => {
				// Connection is alive
			});

			update((state) => ({ ...state, connected: true, error: null }));
		} catch (e) {
			console.error('Error creating SSE connection:', e);
			update((state) => ({
				...state,
				connected: false,
				error: 'Gagal membuat koneksi real-time'
			}));
		}
	}

	function disconnect() {
		if (reconnectTimeout) {
			clearTimeout(reconnectTimeout);
			reconnectTimeout = null;
		}
		if (sourceConnection) {
			sourceConnection.close();
			sourceConnection = null;
		}
		update((state) => ({ ...state, connected: false }));
	}

	// Initialize dengan data dari server (hydration)
	function initialize(data: { unreadCount: number; notifications: Notification[] }) {
		update((state) => ({
			...state,
			unreadCount: data.unreadCount,
			notifications: data.notifications
		}));
	}

	// Update setelah mark as read
	function markAsRead(notificationId: number) {
		update((state) => ({
			...state,
			notifications: state.notifications.map((n) =>
				n.id === notificationId ? { ...n, isRead: true } : n
			),
			unreadCount: Math.max(0, state.unreadCount - 1)
		}));
	}

	// Mark all as read
	function markAllAsRead() {
		update((state) => ({
			...state,
			notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
			unreadCount: 0
		}));
	}

	// Refresh data secara manual
	async function refresh() {
		if (!browser) return;

		try {
			const response = await fetch('/api/notifications');
			if (response.ok) {
				const data = await response.json();
				update((state) => ({
					...state,
					unreadCount: data.unreadCount,
					notifications: data.notifications
				}));
			}
		} catch (e) {
			console.error('Error refreshing notifications:', e);
		}
	}

	return {
		subscribe,
		connect,
		disconnect,
		initialize,
		markAsRead,
		markAllAsRead,
		refresh
	};
}

export const notificationStore = createNotificationStore();

// Derived stores untuk akses mudah
export const unreadCount = derived(notificationStore, ($store) => $store.unreadCount);
export const notifications = derived(notificationStore, ($store) => $store.notifications);
export const isConnected = derived(notificationStore, ($store) => $store.connected);
