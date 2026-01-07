import { produce } from 'sveltekit-sse';
import { getUnreadCount, getNotifications } from '$lib/server/notifications';
import { registerConnection, unregisterConnection } from '$lib/server/notificationEmitter';
import type { RequestHandler } from './$types';

/**
 * SSE endpoint untuk streaming notifikasi real-time
 * Client connect ke endpoint ini dan menerima update otomatis
 */
export const POST: RequestHandler = async ({ locals }) => {
	if (!locals.user) {
		return new Response('Unauthorized', { status: 401 });
	}

	const userId = locals.user.id;

	return produce(async function start({ emit }) {
		// Register connection untuk user ini
		registerConnection(userId, emit);

		// Kirim data awal
		try {
			const unreadCount = await getUnreadCount(userId);
			const notifications = await getNotifications(userId, { limit: 10 });

			emit(
				'initial',
				JSON.stringify({
					unreadCount,
					notifications
				})
			);
		} catch (error) {
			console.error('Error fetching initial notifications:', error);
		}

		// Kirim heartbeat setiap 30 detik untuk menjaga koneksi
		const heartbeatInterval = setInterval(() => {
			const { error } = emit('heartbeat', Date.now().toString());
			if (error) {
				clearInterval(heartbeatInterval);
			}
		}, 30000);

		// Cleanup function - dipanggil saat koneksi ditutup
		return function cleanup() {
			clearInterval(heartbeatInterval);
			unregisterConnection(userId, emit);
		};
	});
};
