import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { storeBranches, stores } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';

/**
 * GET /api/stores/[storeId]/branches/[branchId]
 * Get a specific branch
 */
export const GET: RequestHandler = async ({ params }) => {
	const storeId = parseInt(params.id);
	const branchId = parseInt(params.branchId);

	if (isNaN(storeId) || isNaN(branchId)) {
		return json({ error: 'Invalid IDs' }, { status: 400 });
	}

	try {
		const [branch] = await db
			.select()
			.from(storeBranches)
			.where(
				and(
					eq(storeBranches.id, branchId),
					eq(storeBranches.storeId, storeId)
				)
			)
			.limit(1);

		if (!branch) {
			return json({ error: 'Branch not found' }, { status: 404 });
		}

		return json({ branch });
	} catch (error) {
		console.error('[Branches] Error fetching:', error);
		return json(
			{ error: error instanceof Error ? error.message : 'Unknown error' },
			{ status: 500 }
		);
	}
};

/**
 * PUT /api/stores/[storeId]/branches/[branchId]
 * Update a branch
 */
export const PUT: RequestHandler = async ({ params, request, locals }) => {
	const storeId = parseInt(params.id);
	const branchId = parseInt(params.branchId);

	if (isNaN(storeId) || isNaN(branchId)) {
		return json({ error: 'Invalid IDs' }, { status: 400 });
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

	if (!store || store.ownerId !== user.id) {
		return json({ error: 'Not authorized' }, { status: 403 });
	}

	try {
		const body = await request.json();
		const { name, address, phone, latitude, longitude, isMain, isActive } = body;

		// If this is marked as main, unset other main branches
		if (isMain) {
			await db
				.update(storeBranches)
				.set({ isMain: false })
				.where(eq(storeBranches.storeId, storeId));
		}

		const [updated] = await db
			.update(storeBranches)
			.set({
				name: name ?? undefined,
				address: address ?? undefined,
				phone: phone ?? undefined,
				latitude: latitude ?? undefined,
				longitude: longitude ?? undefined,
				isMain: isMain ?? undefined,
				isActive: isActive ?? undefined
			})
			.where(
				and(
					eq(storeBranches.id, branchId),
					eq(storeBranches.storeId, storeId)
				)
			)
			.returning();

		if (!updated) {
			return json({ error: 'Branch not found' }, { status: 404 });
		}

		return json({ success: true, branch: updated });
	} catch (error) {
		console.error('[Branches] Error updating:', error);
		return json(
			{ error: error instanceof Error ? error.message : 'Unknown error' },
			{ status: 500 }
		);
	}
};

/**
 * DELETE /api/stores/[storeId]/branches/[branchId]
 * Delete a branch
 */
export const DELETE: RequestHandler = async ({ params, locals }) => {
	const storeId = parseInt(params.id);
	const branchId = parseInt(params.branchId);

	if (isNaN(storeId) || isNaN(branchId)) {
		return json({ error: 'Invalid IDs' }, { status: 400 });
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

	if (!store || store.ownerId !== user.id) {
		return json({ error: 'Not authorized' }, { status: 403 });
	}

	try {
		await db
			.delete(storeBranches)
			.where(
				and(
					eq(storeBranches.id, branchId),
					eq(storeBranches.storeId, storeId)
				)
			);

		return json({ success: true, message: 'Branch deleted' });
	} catch (error) {
		console.error('[Branches] Error deleting:', error);
		return json(
			{ error: error instanceof Error ? error.message : 'Unknown error' },
			{ status: 500 }
		);
	}
};
