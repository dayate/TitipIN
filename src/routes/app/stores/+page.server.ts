import type { PageServerLoad } from './$types';
import { getUserStores } from '$lib/server/members';
import { getPublicStores } from '$lib/server/stores';

export const load: PageServerLoad = async ({ locals }) => {
	const memberships = await getUserStores(locals.user!.id);
	const publicStores = await getPublicStores();

	// Filter out stores user has already joined
	const joinedStoreIds = new Set(memberships.map(m => m.store.id));
	const discoverStores = publicStores.filter(s => !joinedStoreIds.has(s.id));

	return { memberships, discoverStores };
};
