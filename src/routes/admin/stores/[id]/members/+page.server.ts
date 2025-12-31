import type { PageServerLoad, Actions } from './$types';
import { error, fail } from '@sveltejs/kit';
import { getStoreById, isStoreOwner } from '$lib/server/stores';
import { getStoreMembers, approveJoinRequest, rejectJoinRequest, kickMember } from '$lib/server/members';

export const load: PageServerLoad = async ({ params, locals }) => {
	const storeId = parseInt(params.id);

	const isOwner = await isStoreOwner(storeId, locals.user!.id);
	if (!isOwner) {
		throw error(403, 'Tidak memiliki akses');
	}

	const store = await getStoreById(storeId);
	if (!store) {
		throw error(404, 'Lapak tidak ditemukan');
	}

	const members = await getStoreMembers(storeId);

	return { store, members };
};

export const actions: Actions = {
	approve: async ({ params, request, locals }) => {
		const storeId = parseInt(params.id);
		const isOwner = await isStoreOwner(storeId, locals.user!.id);
		if (!isOwner) {
			return fail(403, { error: 'Tidak memiliki akses' });
		}

		const data = await request.formData();
		const memberId = parseInt(data.get('memberId')?.toString() || '0');

		try {
			await approveJoinRequest(memberId);
			return { success: true, action: 'approve' };
		} catch (err) {
			return fail(500, { error: 'Gagal menyetujui anggota' });
		}
	},

	reject: async ({ params, request, locals }) => {
		const storeId = parseInt(params.id);
		const isOwner = await isStoreOwner(storeId, locals.user!.id);
		if (!isOwner) {
			return fail(403, { error: 'Tidak memiliki akses' });
		}

		const data = await request.formData();
		const memberId = parseInt(data.get('memberId')?.toString() || '0');
		const reason = data.get('reason')?.toString().trim();

		try {
			await rejectJoinRequest(memberId, reason);
			return { success: true, action: 'reject' };
		} catch (err) {
			return fail(500, { error: 'Gagal menolak anggota' });
		}
	},

	kick: async ({ params, request, locals }) => {
		const storeId = parseInt(params.id);
		const isOwner = await isStoreOwner(storeId, locals.user!.id);
		if (!isOwner) {
			return fail(403, { error: 'Tidak memiliki akses' });
		}

		const data = await request.formData();
		const memberId = parseInt(data.get('memberId')?.toString() || '0');

		try {
			await kickMember(memberId);
			return { success: true, action: 'kick' };
		} catch (err) {
			return fail(500, { error: 'Gagal mengeluarkan anggota' });
		}
	}
};
