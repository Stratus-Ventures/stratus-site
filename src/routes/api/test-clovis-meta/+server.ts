import { json, error } from '@sveltejs/kit';
import { getAllProducts } from '$lib/server/stratus-api';

export async function GET() {
	try {
		// Get all products from our database
		const products = await getAllProducts();
		
		return json({
			success: true,
			message: 'Products retrieved from database',
			productsCount: products.length,
			products: products,
			timestamp: new Date().toISOString()
		});
	} catch (err) {
		throw error(500, `Failed to get products: ${err instanceof Error ? err.message : 'Unknown error'}`);
	}
}