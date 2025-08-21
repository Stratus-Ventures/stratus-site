import { json, error } from '@sveltejs/kit';
import { syncAllProducts, getAllProducts, getAllMetrics } from '$lib/server/stratus-internal';
import { logger } from '$lib/server/logger';



export async function GET() {
	try {
		// Sync all products
		await syncAllProducts();
		logger.sync('Sync all products completed');
		
		// Get results
		const products = await getAllProducts();
		const metrics = await getAllMetrics();
		
		const response = {
			success: true,
			message: 'All products synced successfully',
			summary: {
				productsCount: products.length,
				metricsCount: metrics.length,
				products: products.map(product => ({
					name: product.name,
					url: product.url,
					tagline: product.tagline
				}))
			},
			timestamp: new Date().toISOString()
		};
		logger.apiSuccess('/api/sync-all', 'Response sent');
		return json(response);
	} catch (err: unknown) {
		if (err instanceof Error) {
			logger.error('Error in /api/sync-all', err);
		} else {
			logger.error('Error in /api/sync-all', { error: String(err) });
		}
		error(500, { message: 'Sync failed' });
	}
}