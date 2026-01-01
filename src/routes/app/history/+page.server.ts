import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { storeMembers, stores } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(302, '/auth/login');
	}

	// Get user's active stores
	const memberships = await db
		.select({
			store: stores,
			member: storeMembers
		})
		.from(storeMembers)
		.innerJoin(stores, eq(storeMembers.storeId, stores.id))
		.where(
			and(
				eq(storeMembers.userId, locals.user.id),
				eq(storeMembers.status, 'active')
			)
		);

	const activeStores = memberships.map(m => m.store);

	// If only one store, redirect directly
	if (activeStores.length === 1) {
		throw redirect(302, `/app/${activeStores[0].id}/history`);
	}

	return { stores: activeStores };
};
