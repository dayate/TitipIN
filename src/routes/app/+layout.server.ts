import type { LayoutServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { getUnreadCount, getNotifications } from '$lib/server/notifications';

export const load: LayoutServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(302, '/auth/login');
	}

	// Get unread notification count and recent notifications for dropdown
	const unreadNotifications = await getUnreadCount(locals.user.id);
	const notifications = await getNotifications(locals.user.id, { limit: 10 });

	return {
		user: locals.user,
		unreadNotifications,
		notifications
	};
};
