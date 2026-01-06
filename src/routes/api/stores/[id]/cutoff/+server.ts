import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getStoreCutoffStatus, autoCancelDraftTransactions, sendCutoffWarnings } from '$lib/server/scheduler';
import { db } from '$lib/server/db';
import { stores } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

/**
 * GET /api/stores/[id]/cutoff
 * Get cutoff status for a store
 */
export const GET: RequestHandler = async ({ params, locals }) => {
	const storeId = parseInt(params.id);

	if (isNaN(storeId)) {
		return json({ error: 'Invalid store ID' }, { status: 400 });
	}

	try {
		const status = await getStoreCutoffStatus(storeId);

		if (!status) {
			return json({ error: 'Store not found' }, { status: 404 });
		}

		return json(status);
	} catch (error) {
		console.error('[Cutoff] Error getting status:', error);
		return json(
			{ error: error instanceof Error ? error.message : 'Unknown error' },
			{ status: 500 }
		);
	}
};

/**
 * POST /api/stores/[id]/cutoff
 * Update cutoff settings for a store
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
		return json({ error: 'Not authorized to modify this store' }, { status: 403 });
	}

	try {
		const body = await request.json();
		const { cutoffTime, autoCancelEnabled, cutoffGracePeriod } = body;

		// Validate cutoffTime format (HH:mm)
		if (cutoffTime && !/^([01]\d|2[0-3]):([0-5]\d)$/.test(cutoffTime)) {
			return json({ error: 'Invalid cutoff time format. Use HH:mm' }, { status: 400 });
		}

		// Validate grace period
		if (cutoffGracePeriod !== undefined && (cutoffGracePeriod < 0 || cutoffGracePeriod > 120)) {
			return json({ error: 'Grace period must be between 0 and 120 minutes' }, { status: 400 });
		}

		// Update store settings
		await db
			.update(stores)
			.set({
				cutoffTime: cutoffTime ?? store.cutoffTime,
				autoCancelEnabled: autoCancelEnabled ?? store.autoCancelEnabled,
				cutoffGracePeriod: cutoffGracePeriod ?? store.cutoffGracePeriod,
				updatedAt: new Date()
			})
			.where(eq(stores.id, storeId));

		// Get updated status
		const status = await getStoreCutoffStatus(storeId);

		return json({
			success: true,
			message: 'Cutoff settings updated',
			status
		});
	} catch (error) {
		console.error('[Cutoff] Error updating settings:', error);
		return json(
			{ error: error instanceof Error ? error.message : 'Unknown error' },
			{ status: 500 }
		);
	}
};

/**
 * PUT /api/stores/[id]/cutoff
 * Trigger manual auto-cancel for this store
 */
export const PUT: RequestHandler = async ({ params, locals }) => {
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
		return json({ error: 'Not authorized to modify this store' }, { status: 403 });
	}

	try {
		const result = await autoCancelDraftTransactions(storeId);

		return json({
			success: true,
			message: `Cancelled ${result.cancelledCount} draft transaction(s)`,
			result
		});
	} catch (error) {
		console.error('[Cutoff] Error auto-cancelling:', error);
		return json(
			{ error: error instanceof Error ? error.message : 'Unknown error' },
			{ status: 500 }
		);
	}
};
