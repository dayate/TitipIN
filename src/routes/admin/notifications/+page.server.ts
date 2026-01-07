import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import {
	getNotifications,
	markAsRead,
	markAllAsRead,
	deleteNotification
} from '$lib/server/notifications';

export const load: PageServerLoad = async ({ locals }) => {
	const notifications = await getNotifications(locals.user!.id, { limit: 100 });

	return { notifications };
};

export const actions: Actions = {
	markAsRead: async ({ request, locals }) => {
		const data = await request.formData();
		const notificationId = parseInt(data.get('notificationId')?.toString() || '0');

		if (!notificationId) {
			return fail(400, { error: 'ID notifikasi tidak valid' });
		}

		try {
			await markAsRead(notificationId);
			return { success: true };
		} catch (err) {
			return fail(500, { error: 'Gagal menandai notifikasi' });
		}
	},

	markAllAsRead: async ({ locals }) => {
		try {
			await markAllAsRead(locals.user!.id);
			return { success: true };
		} catch (err) {
			return fail(500, { error: 'Gagal menandai semua notifikasi' });
		}
	},

	delete: async ({ request }) => {
		const data = await request.formData();
		const notificationId = parseInt(data.get('notificationId')?.toString() || '0');

		if (!notificationId) {
			return fail(400, { error: 'ID notifikasi tidak valid' });
		}

		try {
			await deleteNotification(notificationId);
			return { success: true };
		} catch (err) {
			return fail(500, { error: 'Gagal menghapus notifikasi' });
		}
	}
};
