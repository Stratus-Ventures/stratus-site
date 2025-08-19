// Main API exports for clean imports
export { getAllProductConfigs, getApiHeaders } from './config';
export { getAllProducts, getProductById, getProductByName, ensureProductExists } from './products';
export { getAllMetrics, syncProductEvents } from './events';
export { syncAllProducts, syncSingleProduct, handleProductDataUpdate } from './sync';

export type { ProductConfig } from './config';
export type { ProductMeta } from './products';
export type { ProductEvent } from './events';

// Main entry point
export async function syncAllProductData() {
	const { syncAllProducts } = await import('./sync');
	return syncAllProducts();
}