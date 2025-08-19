import { db } from '$lib/server/db/index';
import { stratusMetrics, type StratusMetric } from '$lib/server/db/schema';
import { and, eq, like } from 'drizzle-orm';
import type { ProductConfig } from './config';
import { getApiHeaders } from './config';
import { logger } from '$lib/server/logger';
import { getProductById } from './products';



export interface ProductEvent {
	id: string;
	source_id: string;
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
		// Build product-based prefix like "clovis-event-"
		const product = await getProductById(productId);
		const productSlug = (product?.name ?? 'product')
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/(^-|-$)/g, '');
		const prefix = `${productSlug}-event-`;

		// Fetch existing rows for this product and prefix for dedupe and numbering
		const existingRows = await db
			.select({
				source_id: stratusMetrics.source_id,
				event_type: stratusMetrics.event_type,
				origin_lat: stratusMetrics.origin_lat,
				origin_long: stratusMetrics.origin_long,
				city_code: stratusMetrics.city_code,
				country_code: stratusMetrics.country_code,
			})
			.from(stratusMetrics)
			.where(
				and(
					eq(stratusMetrics.from_product, productId),
					like(stratusMetrics.source_id, `${prefix}%`)
				)
			);

		const signature = (e: ProductEvent) => `${e.event_type}|${e.origin_lat}|${e.origin_long}|${e.city_code}|${e.country_code}`;
		const existingSignatures = new Set(
			existingRows.map((r: { event_type: ProductEvent['event_type']; origin_lat: string; origin_long: string; city_code: string; country_code: string; }) => `${r.event_type}|${r.origin_lat}|${r.origin_long}|${r.city_code}|${r.country_code}`)
		);
		const deduped = events.filter((e) => !existingSignatures.has(signature(e)));
		if (!deduped.length) return 0;

		// Determine next numeric suffix
		let maxN = 0;
		for (const row of existingRows) {
			const nStr = row.source_id.slice(prefix.length);
			const n = Number(nStr);
			if (Number.isInteger(n) && n > maxN) maxN = n;
		}

		// Assign sequential IDs and insert
		let next = maxN + 1;
		const eventsToInsert = deduped.map((event) => ({
			source_id: `${prefix}${next++}`,
			event_type: event.event_type,
			origin_lat: event.origin_lat,
			origin_long: event.origin_long,
			city_code: event.city_code,
			country_code: event.country_code,
			from_product: productId,
		}));

		await db.insert(stratusMetrics).values(eventsToInsert);
		return eventsToInsert.length;

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