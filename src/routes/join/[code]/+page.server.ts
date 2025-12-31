import type { PageServerLoad, Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { validateInviteCode, useInviteCode } from '$lib/server/invites';
import { joinStore, getMemberByUserAndStore } from '$lib/server/members';
import { getStoreById } from '$lib/server/stores';

export const load: PageServerLoad = async ({ params }) => {
	const code = params.code.toUpperCase();

	// Validate the invite code
	const validation = await validateInviteCode(code);

	return {
		code,
		valid: validation.valid,
		store: validation.store || null,
		error: validation.error || null
	};
};

export const actions: Actions = {
	default: async ({ params, locals }) => {
		const code = params.code.toUpperCase();

		// Check if user is logged in
		if (!locals.user) {
			redirect(302, `/auth/login?redirect=/join/${code}`);
		}

		// Validate invite code
		const validation = await validateInviteCode(code);
		if (!validation.valid) {
			return fail(400, { error: validation.error });
		}

		const { store } = validation;

		// Check if already a member
		const existingMember = await getMemberByUserAndStore(locals.user.id, store!.id);
		if (existingMember) {
			if (existingMember.status === 'active') {
				return fail(400, { error: 'Anda sudah menjadi anggota lapak ini' });
			} else if (existingMember.status === 'pending') {
				return fail(400, { error: 'Permintaan Anda sedang menunggu persetujuan' });
			}
		}

		try {
			// Get store to check autoApprove setting
			const storeData = await getStoreById(store!.id);

			// Join store with auto-approve if enabled
			await joinStore(locals.user.id, store!.id, {
				inviteCode: code,
				autoApprove: storeData?.autoApprove || false
			});

			// Increment usage counter
			await useInviteCode(code);

			return {
				success: true,
				autoApproved: storeData?.autoApprove || false
			};
		} catch (err) {
			console.error('Join store error:', err);
			return fail(500, { error: 'Gagal bergabung, silakan coba lagi' });
		}
	}
};
