import type { PageServerLoad, Actions } from './$types';
import { error, fail } from '@sveltejs/kit';
import { getStoreById, isStoreOwner } from '$lib/server/stores';
import {
	getStoreMembers,
	approveJoinRequest,
	rejectJoinRequest,
	kickMember,
	getMemberById,
	approveLeaveRequest,
	cancelLeaveRequest,
	promoteToAdmin,
	demoteFromAdmin
} from '$lib/server/members';
import {
	notifyJoinApproved,
	notifyJoinRejected,
	notifyMemberKicked,
	notifyLeaveApproved,
	createNotification
} from '$lib/server/notifications';
import { sanitizeReason } from '$lib/server/sanitize';

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
		const reason = sanitizeReason(data.get('reason')?.toString());

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
			await notifyLeaveApproved(member.userId, store!.name, storeId);

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
	},

	// Admin role management
	promoteAdmin: async ({ params, request, locals }) => {
		const storeId = parseInt(params.id);
		const isOwner = await isStoreOwner(storeId, locals.user!.id);
		if (!isOwner) {
			return fail(403, { error: 'Hanya owner yang bisa mengelola admin' });
		}

		const data = await request.formData();
		const memberId = parseInt(data.get('memberId')?.toString() || '0');

		try {
			const member = await getMemberById(memberId);
			if (!member) {
				return fail(404, { error: 'Member tidak ditemukan' });
			}

			if (member.status !== 'active') {
				return fail(400, { error: 'Member harus aktif untuk dijadikan admin' });
			}

			const store = await getStoreById(storeId);
			await promoteToAdmin(memberId);

			// Log audit
			const { logMemberAudit } = await import('$lib/server/audit');
			await logMemberAudit(
				memberId,
				'member_promoted',
				locals.user!.id,
				{ role: 'member' },
				{ role: 'admin' }
			);

			// Notify the new admin
			await createNotification({
				userId: member.userId,
				type: 'info',
				title: 'Anda Ditunjuk Sebagai Admin 🎉',
				message: `Selamat! Anda sekarang menjadi admin di ${store!.name}. Anda dapat membantu mengelola lapak.`,
				detailUrl: `/admin/stores/${storeId}`,
				relatedStoreId: storeId
			});

			return { success: true, action: 'promoteAdmin' };
		} catch (err) {
			console.error('Promote admin error:', err);
			return fail(500, { error: 'Gagal menjadikan admin' });
		}
	},

	demoteAdmin: async ({ params, request, locals }) => {
		const storeId = parseInt(params.id);
		const isOwner = await isStoreOwner(storeId, locals.user!.id);
		if (!isOwner) {
			return fail(403, { error: 'Hanya owner yang bisa mengelola admin' });
		}

		const data = await request.formData();
		const memberId = parseInt(data.get('memberId')?.toString() || '0');

		try {
			const member = await getMemberById(memberId);
			if (!member) {
				return fail(404, { error: 'Member tidak ditemukan' });
			}

			const store = await getStoreById(storeId);
			await demoteFromAdmin(memberId);

			// Log audit
			const { logMemberAudit } = await import('$lib/server/audit');
			await logMemberAudit(
				memberId,
				'member_demoted',
				locals.user!.id,
				{ role: 'admin' },
				{ role: 'member' }
			);

			// Notify the demoted admin
			await createNotification({
				userId: member.userId,
				type: 'info',
				title: 'Status Admin Dicabut',
				message: `Status admin Anda di ${store!.name} telah dicabut. Anda tetap menjadi anggota lapak.`,
				detailUrl: '/app/stores',
				relatedStoreId: storeId
			});

			return { success: true, action: 'demoteAdmin' };
		} catch (err) {
			console.error('Demote admin error:', err);
			return fail(500, { error: 'Gagal mencabut status admin' });
		}
	}
};
