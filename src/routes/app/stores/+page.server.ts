import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { getUserStores, requestLeaveStore, getMemberById } from '$lib/server/members';
import { getPublicStores, getStoreById } from '$lib/server/stores';
import { notifyLeaveRequest } from '$lib/server/notifications';

export const load: PageServerLoad = async ({ locals }) => {
	const memberships = await getUserStores(locals.user!.id);
	const publicStores = await getPublicStores();

	// Filter out stores user has already joined (active, pending, leaving)
	const joinedStoreIds = new Set(memberships.map(m => m.store.id));
	const discoverStores = publicStores.filter(s => !joinedStoreIds.has(s.id));

	return { memberships, discoverStores };
};

export const actions: Actions = {
	requestLeave: async ({ request, locals }) => {
		const data = await request.formData();
		const memberId = parseInt(data.get('memberId')?.toString() || '0');
		const reason = data.get('reason')?.toString().trim();

		if (!memberId) {
			return fail(400, { error: 'Data tidak valid' });
		}

		if (!reason || reason.length < 5) {
			return fail(400, { error: 'Alasan keluar minimal 5 karakter' });
		}

		// Verify this member belongs to the current user
		const member = await getMemberById(memberId);
		if (!member || member.userId !== locals.user!.id) {
			return fail(403, { error: 'Tidak memiliki akses' });
		}

		if (member.status !== 'active') {
			return fail(400, { error: 'Hanya anggota aktif yang bisa mengajukan keluar' });
		}

		try {
			await requestLeaveStore(memberId, reason);

			// Notify store owner about leave request
			await notifyLeaveRequest(member.storeId, locals.user!.name, memberId, reason);

			return { success: true };
		} catch (err) {
			console.error('Request leave error:', err);
			return fail(500, { error: 'Gagal mengajukan permintaan keluar' });
		}
	}
};
