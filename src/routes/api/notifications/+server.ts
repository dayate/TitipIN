import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { getUnreadCount, getNotifications } from '$lib/server/notifications';

/**
 * API endpoint untuk fetch notifikasi
 * Digunakan untuk refresh manual data
 */
export const GET = async ({ locals }: RequestEvent) => {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const unreadCount = await getUnreadCount(locals.user.id);
		const notifications = await getNotifications(locals.user.id, { limit: 10 });

		return json({
			unreadCount,
			notifications
		});
	} catch (error) {
		console.error('Error fetching notifications:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
