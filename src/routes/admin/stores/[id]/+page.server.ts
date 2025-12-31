import type { PageServerLoad, Actions } from './$types';
import { error, fail, redirect, isRedirect } from '@sveltejs/kit';
import { getStoreWithStats, updateStore, deleteStore, isStoreOwner } from '$lib/server/stores';

export const load: PageServerLoad = async ({ params, locals }) => {
	const storeId = parseInt(params.id);

	// Check ownership
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
				autoApprove
			});

			return { success: true, message: 'Lapak berhasil diupdate' };
		} catch (err) {
			console.error('Update store error:', err);
			return fail(500, { error: 'Gagal mengupdate lapak' });
		}
	},

	toggleStatus: async ({ params, locals }) => {
		const storeId = parseInt(params.id);
		const isOwner = await isStoreOwner(storeId, locals.user!.id);
		if (!isOwner) {
			return fail(403, { error: 'Tidak memiliki akses' });
		}

		try {
			const store = await getStoreWithStats(storeId);
			if (store) {
				await updateStore(storeId, { isOpen: !store.isOpen });
			}
			return { success: true };
		} catch (err) {
			return fail(500, { error: 'Gagal mengubah status' });
		}
	},

	delete: async ({ params, locals }) => {
		const storeId = parseInt(params.id);
		const isOwner = await isStoreOwner(storeId, locals.user!.id);
		if (!isOwner) {
			return fail(403, { error: 'Tidak memiliki akses' });
		}

		try {
			await deleteStore(storeId);
			redirect(302, '/admin/stores');
		} catch (err) {
			if (isRedirect(err)) throw err;
			return fail(500, { error: 'Gagal menghapus lapak' });
		}
	}
};
