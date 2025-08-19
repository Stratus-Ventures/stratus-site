import { getAllProductConfigs } from './config';
import { ensureProductExists } from './products';
import { syncProductEvents } from './events';
import { logger } from './logger';



export async function syncSingleProduct(productName: string): Promise<boolean> {
	const configs = getAllProductConfigs();
	const config = configs.find(c => c.name === productName);
	
	if (!config) {
		logger.warn(`No configuration found for product`, { productName });
		return false;
	}

	logger.debug(`Starting product sync`, { product: config.name });

	// Ensure product exists in database
	const productId = await ensureProductExists(config);
	if (!productId) {
		logger.error(`Failed to ensure product exists`, { product: config.name });
		return false;
	}

	// Sync events
	const eventCount = await syncProductEvents(config, productId);
	logger.debug(`Product sync completed`, { product: config.name, eventCount });
	
	return true;
}


export async function syncAllProducts(): Promise<void> {
	logger.info('Starting full product sync');
	
	const configs = getAllProductConfigs();
	logger.info(`Found product configurations`, { count: configs.length });

	const results = await Promise.allSettled(
		configs.map(config => syncSingleProduct(config.name))
	);

	const successful = results.filter(r => r.status === 'fulfilled' && r.value).length;
	const failed = results.length - successful;

	logger.info('Full product sync completed', { successful, failed });
}


// Stream-ready function for real-time updates
export async function handleProductDataUpdate(productName: string, changeType: 'insert' | 'update' | 'delete') {
	logger.debug('Handling product data update', { productName, changeType });
	
	switch (changeType) {
		case 'insert':
		case 'update':
			await syncSingleProduct(productName);
			break;
		case 'delete':
			logger.debug('Product deleted - no sync needed', { productName });
			break;
	}
}