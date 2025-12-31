import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { validateInviteCode, useInviteCode } from '$lib/server/invites';
import { joinStore, getMemberByUserAndStore, getMemberById } from '$lib/server/members';
import { getStoreById } from '$lib/server/stores';
import { notifyNewJoinRequest, notifyJoinApproved } from '$lib/server/notifications';

export const load: PageServerLoad = async () => {
	return {};
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const data = await request.formData();
		const code = data.get('code')?.toString().trim().toUpperCase();

		if (!code || code.length < 6) {
			return fail(400, { error: 'Masukkan kode undangan yang valid' });
		}

		// Validate invite code
		const validation = await validateInviteCode(code);
		if (!validation.valid) {
			return fail(400, { error: validation.error });
		}

		const { invite, store } = validation;

		// Check if already a member
		const existingMember = await getMemberByUserAndStore(locals.user!.id, store!.id);
		if (existingMember) {
			if (existingMember.status === 'active') {
				return fail(400, { error: 'Anda sudah menjadi anggota lapak ini' });
			} else if (existingMember.status === 'pending') {
				return fail(400, { error: 'Permintaan Anda sedang menunggu persetujuan' });
			} else if (existingMember.status === 'rejected') {
				return fail(400, { error: 'Permintaan Anda sebelumnya ditolak' });
			}
		}

		try {
			// Get store to check autoApprove setting
			const storeData = await getStoreById(store!.id);
			const autoApprove = storeData?.autoApprove || false;

			// Join store with auto-approve if enabled
			const member = await joinStore(locals.user!.id, store!.id, {
				inviteCode: code,
				autoApprove
			});

			// Increment usage counter
			await useInviteCode(code);

			// Send notifications
			if (autoApprove) {
				// Notify user they're auto-approved
				await notifyJoinApproved(locals.user!.id, store!.name, store!.id);
			} else {
				// Notify store owner about new join request
				await notifyNewJoinRequest(store!.id, locals.user!.name, member.id);
			}

			return {
				success: true,
				storeName: store!.name,
				autoApproved: autoApprove
			};
		} catch (err) {
			console.error('Join store error:', err);
			return fail(500, { error: 'Gagal bergabung, silakan coba lagi' });
		}
	}
};
