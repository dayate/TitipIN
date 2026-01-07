import type { PageServerLoad, Actions } from './$types';
import { error, fail } from '@sveltejs/kit';
import { getStoreWithStats, updateStore, isStoreOwner } from '$lib/server/stores';
import { sanitizeInput, sanitizeAnnouncement } from '$lib/server/sanitize';

export const load: PageServerLoad = async ({ params, locals }) => {
	const storeId = parseInt(params.id);

	const isOwner = await isStoreOwner(storeId, locals.user!.id);
	if (!isOwner) {
		throw error(403, 'Anda tidak memiliki akses ke lapak ini');
	}

	const store = await getStoreWithStats(storeId);
	if (!store) {
		throw error(404, 'Lapak tidak ditemukan');
	}

	return { store };
};

export const actions: Actions = {
	update: async ({ params, request, locals }) => {
		const storeId = parseInt(params.id);
		const isOwner = await isStoreOwner(storeId, locals.user!.id);
		if (!isOwner) {
			return fail(403, { error: 'Tidak memiliki akses' });
		}

		const data = await request.formData();
		const name = data.get('name')?.toString().trim();
		const description = data.get('description')?.toString().trim();
		const phone = data.get('phone')?.toString().trim();
		const address = data.get('address')?.toString().trim();
		const operatingDays = data.get('operatingDays')?.toString().trim();
		const openTime = data.get('openTime')?.toString().trim();
		const closeTime = data.get('closeTime')?.toString().trim();
		const visibility = data.get('visibility')?.toString() as 'public' | 'private';
		const autoApprove = data.get('autoApprove')?.toString() === 'true';
		// Cut-off settings
		const cutoffTime = data.get('cutoffTime')?.toString().trim();
		const autoCancelEnabled = data.get('autoCancelEnabled')?.toString() === 'true';
		const cutoffGracePeriod = parseInt(data.get('cutoffGracePeriod')?.toString() || '30');

		if (!name || name.length < 3) {
			return fail(400, { error: 'Nama lapak minimal 3 karakter' });
		}

		try {
			await updateStore(storeId, {
				name,
				description: description || null,
				phone: phone || null,
				address: address || null,
				operatingDays: operatingDays || null,
				openTime: openTime || null,
				closeTime: closeTime || null,
				visibility,
				autoApprove,
				cutoffTime: cutoffTime || '11:00',
				autoCancelEnabled,
				cutoffGracePeriod: isNaN(cutoffGracePeriod) ? 30 : cutoffGracePeriod
			});

			return { success: true, message: 'Pengaturan berhasil disimpan' };
		} catch (err) {
			console.error('Update store error:', err);
			return fail(500, { error: 'Gagal menyimpan pengaturan' });
		}
	},

	emergencyMode: async ({ params, request, locals }) => {
		const storeId = parseInt(params.id);
		const isOwner = await isStoreOwner(storeId, locals.user!.id);
		if (!isOwner) {
			return fail(403, { error: 'Tidak memiliki akses' });
		}

		const data = await request.formData();
		const enabled = data.get('enabled')?.toString() === 'true';
		const reason = data.get('reason')?.toString().trim();

		try {
			const store = await updateStore(storeId, { emergencyMode: enabled });

			// Log store status change
			if (enabled) {
				const { logEmergencyClose } = await import('$lib/server/storeStatus');
				await logEmergencyClose(storeId, reason);
			}

			// Notify all suppliers if emergency mode is enabled
			if (enabled && store) {
				const { notifyStoreClosed } = await import('$lib/server/notifications');
				await notifyStoreClosed(storeId, store.name, reason);
			}

			return {
				success: true,
				message: enabled ? 'Mode darurat diaktifkan' : 'Mode darurat dinonaktifkan'
			};
		} catch (err) {
			console.error('Emergency mode error:', err);
			return fail(500, { error: 'Gagal mengubah mode darurat' });
		}
	}
};
