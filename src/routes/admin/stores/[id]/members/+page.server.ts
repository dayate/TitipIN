import type { PageServerLoad, Actions } from './$types';
import { error, fail } from '@sveltejs/kit';
import { getStoreById, isStoreOwner } from '$lib/server/stores';
import { getStoreMembers, approveJoinRequest, rejectJoinRequest, kickMember, getMemberById, approveLeaveRequest, cancelLeaveRequest } from '$lib/server/members';
import { notifyJoinApproved, notifyJoinRejected, notifyMemberKicked, createNotification } from '$lib/server/notifications';

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
			const member = await getMemberById(memberId);
			if (!member) {
				return fail(404, { error: 'Member tidak ditemukan' });
			}

			const store = await getStoreById(storeId);
			await approveJoinRequest(memberId);

			await notifyJoinApproved(member.userId, store!.name, storeId);

			return { success: true, action: 'approve' };
		} catch (err) {
			console.error('Approve error:', err);
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
			const member = await getMemberById(memberId);
			if (!member) {
				return fail(404, { error: 'Member tidak ditemukan' });
			}

			const store = await getStoreById(storeId);
			await rejectJoinRequest(memberId, reason);

			await notifyJoinRejected(member.userId, store!.name, storeId, reason);

			return { success: true, action: 'reject' };
		} catch (err) {
			console.error('Reject error:', err);
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
			const member = await getMemberById(memberId);
			if (!member) {
				return fail(404, { error: 'Member tidak ditemukan' });
			}

			const store = await getStoreById(storeId);
			await notifyMemberKicked(member.userId, store!.name, storeId);
			await kickMember(memberId);

			return { success: true, action: 'kick' };
		} catch (err) {
			console.error('Kick error:', err);
			return fail(500, { error: 'Gagal mengeluarkan anggota' });
		}
	},

	approveLeave: async ({ params, request, locals }) => {
		const storeId = parseInt(params.id);
		const isOwner = await isStoreOwner(storeId, locals.user!.id);
		if (!isOwner) {
			return fail(403, { error: 'Tidak memiliki akses' });
		}

		const data = await request.formData();
		const memberId = parseInt(data.get('memberId')?.toString() || '0');

		try {
			const member = await getMemberById(memberId);
			if (!member) {
				return fail(404, { error: 'Member tidak ditemukan' });
			}

			const store = await getStoreById(storeId);

			// Notify user that leave request is approved
			await createNotification({
				userId: member.userId,
				type: 'info',
				title: 'Permintaan Keluar Disetujui',
				message: `Anda telah berhasil keluar dari ${store!.name}. Terima kasih atas kontribusi Anda.`,
				detailUrl: '/app/stores',
				relatedStoreId: storeId
			});

			await approveLeaveRequest(memberId);

			return { success: true, action: 'approveLeave' };
		} catch (err) {
			console.error('Approve leave error:', err);
			return fail(500, { error: 'Gagal menyetujui permintaan keluar' });
		}
	},

	cancelLeave: async ({ params, request, locals }) => {
		const storeId = parseInt(params.id);
		const isOwner = await isStoreOwner(storeId, locals.user!.id);
		if (!isOwner) {
			return fail(403, { error: 'Tidak memiliki akses' });
		}

		const data = await request.formData();
		const memberId = parseInt(data.get('memberId')?.toString() || '0');

		try {
			const member = await getMemberById(memberId);
			if (!member) {
				return fail(404, { error: 'Member tidak ditemukan' });
			}

			const store = await getStoreById(storeId);

			// Notify user that leave request is cancelled
			await createNotification({
				userId: member.userId,
				type: 'info',
				title: 'Permintaan Keluar Ditolak',
				message: `Admin menolak permintaan Anda untuk keluar dari ${store!.name}. Anda tetap menjadi anggota.`,
				detailUrl: '/app/stores',
				relatedStoreId: storeId
			});

			await cancelLeaveRequest(memberId);

			return { success: true, action: 'cancelLeave' };
		} catch (err) {
			console.error('Cancel leave error:', err);
			return fail(500, { error: 'Gagal membatalkan permintaan keluar' });
		}
	}
};
