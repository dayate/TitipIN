import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { runScheduler } from '$lib/server/scheduler';

/**
 * POST /api/scheduler/run
 * Manually trigger the scheduler to check cutoffs and auto-cancel drafts
 * This can be called by a cron service (e.g., Vercel Cron, Railway Cron)
 */
export const POST: RequestHandler = async ({ request }) => {
	try {
		// Optional: Add authorization check for production
		// const authHeader = request.headers.get('Authorization');
		// if (authHeader !== `Bearer ${CRON_SECRET}`) {
		//     return json({ error: 'Unauthorized' }, { status: 401 });
		// }

		const result = await runScheduler();

		return json({
			success: true,
			...result
		});
	} catch (error) {
		console.error('[Scheduler] Error running scheduler:', error);
		return json(
			{
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error'
			},
			{ status: 500 }
		);
	}
};

/**
 * GET /api/scheduler/run
 * Get scheduler status (for debugging)
 */
export const GET: RequestHandler = async () => {
	return json({
		status: 'ready',
		currentTime: new Date().toISOString(),
		description: 'POST to this endpoint to run the scheduler'
	});
};
