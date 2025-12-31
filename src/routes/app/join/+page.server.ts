import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { validateInviteCode, useInviteCode } from '$lib/server/invites';
import { joinStore, getMemberByUserAndStore } from '$lib/server/members';
import { getStoreById } from '$lib/server/stores';

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

			// Join store with auto-approve if enabled
			await joinStore(locals.user!.id, store!.id, {
				inviteCode: code,
				autoApprove: storeData?.autoApprove || false
			});

			// Increment usage counter
			await useInviteCode(code);

			return {
				success: true,
				storeName: store!.name,
				autoApproved: storeData?.autoApprove || false
			};
		} catch (err) {
			console.error('Join store error:', err);
			return fail(500, { error: 'Gagal bergabung, silakan coba lagi' });
		}
	}
};
