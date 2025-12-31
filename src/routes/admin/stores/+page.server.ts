import type { PageServerLoad } from './$types';
import { getStoresWithStats } from '$lib/server/stores';

export const load: PageServerLoad = async ({ locals }) => {
	const stores = await getStoresWithStats(locals.user!.id);

	return {
		stores
	};
};
