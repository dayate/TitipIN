import type { Actions } from './$types';
import { redirect } from '@sveltejs/kit';
import { invalidateSession } from '$lib/server/auth';

export const actions: Actions = {
	default: async ({ cookies, locals }) => {
		const sessionId = cookies.get('session_id');

		if (sessionId) {
			await invalidateSession(sessionId);
			cookies.delete('session_id', { path: '/' });
		}

		throw redirect(302, '/');
	}
};
