import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { stores } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user || locals.user.role !== 'owner') {
		throw redirect(302, '/app');
	}

	// Get owner's stores
	const ownerStores = await db
		.select()
		.from(stores)
		.where(eq(stores.ownerId, locals.user.id));

	// If only one store, redirect directly
	if (ownerStores.length === 1) {
		throw redirect(302, `/admin/stores/${ownerStores[0].id}/products`);
	}

	return { stores: ownerStores };
};
