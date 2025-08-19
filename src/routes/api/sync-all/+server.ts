import { json, error } from '@sveltejs/kit';
import { syncAllProducts, getAllProducts, getAllMetrics } from '$lib/server/stratus-internal';



export async function GET() {
	try {
		// Sync all products
		await syncAllProducts();
		
		// Get results
		const products = await getAllProducts();
		const metrics = await getAllMetrics();
		
		return json({
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
		});
	} catch (err) {
		throw error(500, `Sync failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
	}
}