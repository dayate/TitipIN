import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { storeBranches, stores } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';

/**
 * GET /api/stores/[id]/branches
 * Get all branches for a store
 */
export const GET: RequestHandler = async ({ params }) => {
	const storeId = parseInt(params.id);

	if (isNaN(storeId)) {
		return json({ error: 'Invalid store ID' }, { status: 400 });
	}

	try {
		const branches = await db
			.select()
			.from(storeBranches)
			.where(eq(storeBranches.storeId, storeId))
			.orderBy(storeBranches.isMain);

		return json({ branches });
	} catch (error) {
		console.error('[Branches] Error fetching:', error);
		return json(
			{ error: error instanceof Error ? error.message : 'Unknown error' },
			{ status: 500 }
		);
	}
};

/**
 * POST /api/stores/[id]/branches
 * Create a new branch
 */
export const POST: RequestHandler = async ({ params, request, locals }) => {
	const storeId = parseInt(params.id);

	if (isNaN(storeId)) {
		return json({ error: 'Invalid store ID' }, { status: 400 });
	}

	// Check authorization
	const user = locals.user;
	if (!user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	// Verify ownership
	const store = await db.query.stores.findFirst({
		where: eq(stores.id, storeId)
	});

	if (!store) {
		return json({ error: 'Store not found' }, { status: 404 });
	}

	if (store.ownerId !== user.id) {
		return json({ error: 'Not authorized' }, { status: 403 });
	}

	try {
		const body = await request.json();
		const { name, address, phone, latitude, longitude, isMain } = body;

		if (!name || !address) {
			return json({ error: 'Name and address are required' }, { status: 400 });
		}

		// If this is marked as main, unset other main branches
		if (isMain) {
			await db
				.update(storeBranches)
				.set({ isMain: false })
				.where(eq(storeBranches.storeId, storeId));
		}

		const [branch] = await db
			.insert(storeBranches)
			.values({
				storeId,
				name,
				address,
				phone: phone || null,
				latitude: latitude || null,
				longitude: longitude || null,
				isMain: isMain || false,
				isActive: true
			})
			.returning();

		return json({ success: true, branch });
	} catch (error) {
		console.error('[Branches] Error creating:', error);
		return json(
			{ error: error instanceof Error ? error.message : 'Unknown error' },
			{ status: 500 }
		);
	}
};
