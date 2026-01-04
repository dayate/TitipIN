import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { getPublicStores, getStoreById } from '$lib/server/stores';
import { getUserStores, joinStore, getMemberByUserAndStore, getActiveMembers } from '$lib/server/members';
import { validateInviteCode, useInviteCode } from '$lib/server/invites';
import { notifyNewJoinRequest, notifyJoinApproved } from '$lib/server/notifications';

export const load: PageServerLoad = async ({ locals }) => {
	const memberships = await getUserStores(locals.user!.id);
	const publicStores = await getPublicStores();

	// Filter out stores user has already joined (active, pending, leaving)
	const joinedStoreIds = new Set(memberships.map(m => m.store.id));
	const discoverStoresRaw = publicStores.filter(s => !joinedStoreIds.has(s.id));

	// Add member count for each public store
	const discoverStores = await Promise.all(
		discoverStoresRaw.map(async (store) => {
			const members = await getActiveMembers(store.id);
			return {
				...store,
				memberCount: members.length
			};
		})
	);

	return { discoverStores };
};

export const actions: Actions = {
	joinWithCode: async ({ request, locals }) => {
		const data = await request.formData();
		const code = data.get('code')?.toString().trim().toUpperCase();

		if (!code || code.length < 6) {
			return fail(400, { joinError: 'Masukkan kode undangan yang valid (minimal 6 karakter)' });
		}

		// Validate invite code
		const validation = await validateInviteCode(code);
		if (!validation.valid) {
			return fail(400, { joinError: validation.error });
		}

		const { invite, store } = validation;

		// Check if already a member
		const existingMember = await getMemberByUserAndStore(locals.user!.id, store!.id);
		if (existingMember) {
			if (existingMember.status === 'active') {
				return fail(400, { joinError: 'Anda sudah menjadi anggota lapak ini' });
			} else if (existingMember.status === 'pending') {
				return fail(400, { joinError: 'Permintaan Anda sedang menunggu persetujuan' });
			} else if (existingMember.status === 'rejected') {
				return fail(400, { joinError: 'Permintaan Anda sebelumnya ditolak. Gunakan kode invite untuk bypass.' });
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
				await notifyJoinApproved(locals.user!.id, store!.name, store!.id);
			} else {
				await notifyNewJoinRequest(store!.id, locals.user!.name, member.id);
			}

			return {
				joinSuccess: true,
				storeName: store!.name,
				autoApproved: autoApprove
			};
		} catch (err) {
			console.error('Join store error:', err);
			return fail(500, { joinError: 'Gagal bergabung, silakan coba lagi' });
		}
	}
};
