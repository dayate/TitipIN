import type { PageServerLoad, Actions } from './$types';
import { error, fail } from '@sveltejs/kit';
import { getStoreById, isStoreOwner } from '$lib/server/stores';
import { getActiveInviteCode, regenerateInviteCode } from '$lib/server/invites';

export const load: PageServerLoad = async ({ params, locals, url }) => {
	const storeId = parseInt(params.id);

	const isOwner = await isStoreOwner(storeId, locals.user!.id);
	if (!isOwner) {
		throw error(403, 'Tidak memiliki akses');
	}

	const store = await getStoreById(storeId);
	if (!store) {
		throw error(404, 'Lapak tidak ditemukan');
	}

	const activeInvite = await getActiveInviteCode(storeId);
	const baseUrl = `${url.protocol}//${url.host}`;

	return { store, activeInvite, baseUrl };
};

export const actions: Actions = {
	generate: async ({ params, request, locals }) => {
		const storeId = parseInt(params.id);
		const isOwner = await isStoreOwner(storeId, locals.user!.id);
		if (!isOwner) {
			return fail(403, { error: 'Tidak memiliki akses' });
		}

		const data = await request.formData();
		const expiresIn = data.get('expiresIn')?.toString() || '168'; // 7 days default

		try {
			const invite = await regenerateInviteCode(storeId, locals.user!.id, {
				expiresInHours: parseInt(expiresIn)
			});

			return { success: true, invite };
		} catch (err) {
			return fail(500, { error: 'Gagal membuat kode undangan' });
		}
	}
};
