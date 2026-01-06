import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { getStoreById, isStoreOwner } from '$lib/server/stores';
import { db } from '$lib/server/db';
import { storeBranches } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';

export const load: PageServerLoad = async ({ params, locals }) => {
	const storeId = parseInt(params.id);

	// Check ownership
	const isOwner = await isStoreOwner(storeId, locals.user!.id);
	if (!isOwner) {
		throw error(403, 'Anda tidak memiliki akses ke lapak ini');
	}

	const store = await getStoreById(storeId);
	if (!store) {
		throw error(404, 'Lapak tidak ditemukan');
	}

	// Get branches
	const branches = await db
		.select()
		.from(storeBranches)
		.where(eq(storeBranches.storeId, storeId))
		.orderBy(desc(storeBranches.isMain), storeBranches.name);

	return { store, branches };
};
