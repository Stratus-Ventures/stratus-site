import { json, error } from '@sveltejs/kit';
import { getAllProducts } from '$lib/server/stratus-internal';
import { logger } from '$lib/server/logger';

export async function GET() {
	try {
		// Get all products from our database
		const products = await getAllProducts();
		logger.apiSuccess('/api/test-clovis-meta', `Retrieved ${products.length} products`);
		
		return json({
			success: true,
			message: 'Products retrieved from database',
			productsCount: products.length,
			products: products,
			timestamp: new Date().toISOString()
		});
	} catch (err) {
		logger.error('Error in test-clovis-meta', err);
		throw error(500, `Failed to get products: ${err instanceof Error ? err.message : 'Unknown error'}`);
	}
}