import type { PageServerLoad, Actions } from './$types';
import { error, fail } from '@sveltejs/kit';
import { getStoreById } from '$lib/server/stores';
import { joinStore, getMemberByUserAndStore, getRejectionCooldownMs, getRejectionCooldownDays, canRejoinAfterRejection } from '$lib/server/members';
import { notifyNewJoinRequest } from '$lib/server/notifications';

export const load: PageServerLoad = async ({ params, locals }) => {
	const storeId = parseInt(params.id);

	const store = await getStoreById(storeId);

	// Check if store exists and is public
	if (!store) {
		throw error(404, 'Lapak tidak ditemukan');
	}

	if (store.visibility !== 'public') {
		throw error(403, 'Lapak ini tidak tersedia untuk umum');
	}

	// Check if user already joined
	let existingMember = null;
	let cooldownMs = 0;
	let canRejoin = true;

	if (locals.user) {
		existingMember = await getMemberByUserAndStore(locals.user.id, storeId);

		// If rejected, calculate cooldown info
		if (existingMember?.status === 'rejected') {
			cooldownMs = getRejectionCooldownMs(existingMember.rejectedAt);
			canRejoin = canRejoinAfterRejection(existingMember.rejectedAt);
		}
	}

	return { store, existingMember, cooldownMs, canRejoin };
};

export const actions: Actions = {
	default: async ({ params, request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Silakan login terlebih dahulu' });
		}

		const storeId = parseInt(params.id);
		const store = await getStoreById(storeId);

		if (!store || store.visibility !== 'public') {
			return fail(404, { error: 'Lapak tidak ditemukan' });
		}

		// Check if already a member
		const existingMember = await getMemberByUserAndStore(locals.user.id, storeId);
		if (existingMember) {
			if (existingMember.status === 'active') {
				return fail(400, { error: 'Anda sudah menjadi anggota lapak ini' });
			} else if (existingMember.status === 'pending') {
				return fail(400, { error: 'Permintaan Anda sedang menunggu persetujuan' });
			} else if (existingMember.status === 'rejected') {
				// Check cooldown
				if (!canRejoinAfterRejection(existingMember.rejectedAt)) {
					const days = getRejectionCooldownDays(existingMember.rejectedAt);
					return fail(400, { error: `Anda harus menunggu ${days} hari lagi untuk mengajukan permintaan bergabung` });
				}
			}
		}

		const data = await request.formData();
		const message = data.get('message')?.toString().trim();

		if (!message || message.length < 10) {
			return fail(400, { error: 'Pesan minimal 10 karakter' });
		}

		try {
			const member = await joinStore(locals.user.id, storeId, {
				message,
				autoApprove: false // Public join always needs approval
			});

			// Notify store owner about new join request
			await notifyNewJoinRequest(storeId, locals.user.name, member.id);

			return { success: true };
		} catch (err: any) {
			console.error('Join store error:', err);
			return fail(500, { error: err.message || 'Gagal mengirim permintaan, silakan coba lagi' });
		}
	}
};
