import type { PageServerLoad, Actions } from './$types';
import { fail, redirect, isRedirect } from '@sveltejs/kit';
import { createStore } from '$lib/server/stores';

export const load: PageServerLoad = async () => {
	return {};
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const data = await request.formData();
		const name = data.get('name')?.toString().trim();
		const description = data.get('description')?.toString().trim();
		const visibility = data.get('visibility')?.toString() as 'public' | 'private';

		// Validation
		if (!name || name.length < 3) {
			return fail(400, { error: 'Nama lapak minimal 3 karakter' });
		}

		if (name.length > 50) {
			return fail(400, { error: 'Nama lapak maksimal 50 karakter' });
		}

		try {
			const store = await createStore(locals.user!.id, {
				name,
				description: description || undefined,
				visibility: visibility || 'private'
			});

			redirect(302, `/admin/stores/${store.id}`);
		} catch (err) {
			// Re-throw redirect
			if (isRedirect(err)) throw err;
			console.error('Create store error:', err);
			return fail(500, { error: 'Gagal membuat lapak, silakan coba lagi' });
		}
	}
};
