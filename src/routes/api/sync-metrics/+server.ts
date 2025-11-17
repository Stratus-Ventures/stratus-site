import { json } from '@sveltejs/kit';
import { syncAllProductMetrics } from '$lib/server/services/metrics';
import { logger } from '$lib/server';
import type { RequestHandler } from './$types';

/**
 * Server-side endpoint to sync metrics from all live products
 * This should be called by a cron job or scheduled task
 *
 * Usage:
 * - Can be called via GET request
 * - No authentication required for now (add auth if needed)
 * - Returns sync results with counts
 */
export const GET: RequestHandler = async () => {
	try {
		logger.info('🔄 Starting metrics sync for all live products');

		const result = await syncAllProductMetrics();

		logger.info(`✅ Metrics sync completed:`, {
			totalProducts: result.totalProducts,
			successfulSyncs: result.successfulSyncs,
			failedSyncs: result.failedSyncs
		});

		return json({
			success: true,
			timestamp: new Date().toISOString(),
			...result
		});
	} catch (error) {
		logger.error('❌ Failed to sync metrics', error);
		return json(
			{
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error',
				timestamp: new Date().toISOString()
			},
			{ status: 500 }
		);
	}
};
