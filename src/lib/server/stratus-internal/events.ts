import { db } from '$lib/server/db/index';
import { stratusMetrics, type StratusMetric } from '$lib/server/db/schema';
import type { ProductConfig } from './config';
import { getApiHeaders } from './config';
import { logger } from '$lib/server/logger';



export interface ProductEvent {
	id: string;
	event_type: 'user_created' | 'download_started' | 'subscription_activated';
	origin_lat: string;
	origin_long: string;
	city_code: string;
	country_code: string;
}



export async function fetchProductEvents(config: ProductConfig): Promise<ProductEvent[]> {
	try {
		const response = await fetch(`${config.apiUrl}/product-events`, {
			headers: getApiHeaders(config.apiKey)
		});

		if (!response.ok) {
			if (response.status === 403) {
				logger.debug(`Product ${config.name} events API blocked (expected CORS behavior)`, { status: response.status });
			} else {
				logger.warn(`Product ${config.name} events API unavailable`, { status: response.status, url: response.url });
			}
			return [];
		}

		const data = await response.json();
		return data.stratusProductEvents || [];

	} catch (error) {
		logger.error(`Failed to fetch events for product ${config.name}`, error);
		return [];
	}
}


export async function saveProductEvents(events: ProductEvent[], productId: string): Promise<number> {
	if (!events.length) {
		return 0;
	}

	try {
		const eventsToInsert = events.map(event => ({
			event_type: event.event_type,
			origin_lat: event.origin_lat,
			origin_long: event.origin_long,
			city_code: event.city_code,
			country_code: event.country_code,
			from_product: productId
		}));

		await db.insert(stratusMetrics).values(eventsToInsert);
		return events.length;

	} catch (error) {
		logger.error(`Failed to save events for product ${productId}`, error);
		return 0;
	}
}


export async function syncProductEvents(config: ProductConfig, productId: string): Promise<number> {
	const events = await fetchProductEvents(config);
	const savedCount = await saveProductEvents(events, productId);
	
	if (savedCount > 0) {
		logger.info(`Events synced for product ${config.name}`, { count: savedCount });
	}
	
	return savedCount;
}


export async function getAllMetrics(): Promise<StratusMetric[]> {
	return await db.select().from(stratusMetrics);
}