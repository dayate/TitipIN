/**
 * Cron API Endpoint for Daily Cut-off Processing
 *
 * This endpoint should be called by an external cron service
 * (e.g., Vercel Cron, GitHub Actions, or cron-job.org)
 *
 * Security: Protected by API_SECRET_KEY environment variable
 */

import { json, error, type RequestHandler } from '@sveltejs/kit';
import { processAllStoresCutoff } from '$lib/server/cutoff';

const API_SECRET_KEY = process.env.CRON_SECRET || 'dev-secret-key';

export const POST: RequestHandler = async ({ request }) => {
	// Verify authorization
	const authHeader = request.headers.get('Authorization');

	if (!authHeader || authHeader !== `Bearer ${API_SECRET_KEY}`) {
		throw error(401, 'Unauthorized');
	}

	try {
		const result = await processAllStoresCutoff();

		return json({
			success: true,
			message: 'Cut-off processing completed',
			data: {
				storesProcessed: result.stores,
				transactionsCancelled: result.transactions,
				timestamp: new Date().toISOString()
			}
		});
	} catch (err) {
		console.error('[Cron] Cut-off processing failed:', err);
		throw error(500, 'Cut-off processing failed');
	}
};

// Also support GET for simple health checks
export const GET: RequestHandler = async () => {
	return json({
		status: 'ok',
		endpoint: 'cutoff',
		description: 'Daily cut-off processing endpoint',
		usage: 'POST with Authorization: Bearer <CRON_SECRET>'
	});
};
