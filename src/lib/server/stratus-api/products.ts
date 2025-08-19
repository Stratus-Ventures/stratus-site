import { db } from '$lib/server/db/index';
import { stratusProducts, type StratusProduct } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { ProductConfig } from './config';
import { getApiHeaders } from './config';
import { logger } from './logger';

export interface ProductMeta {
	name: string;
	tagline: string;
	url: string;
}



export async function getProductById(productId: string): Promise<StratusProduct | null> {
	const products = await db
		.select()
		.from(stratusProducts)
		.where(eq(stratusProducts.id, productId))
		.limit(1);
	
	return products[0] || null;
}

export async function getProductByName(name: string): Promise<StratusProduct | null> {
	const products = await db
		.select()
		.from(stratusProducts)
		.where(eq(stratusProducts.name, name))
		.limit(1);
	
	return products[0] || null;
}


export async function fetchProductMeta(config: ProductConfig): Promise<ProductMeta | null> {
	try {
		const response = await fetch(`${config.apiUrl}/stratus-product-meta`, {
			headers: getApiHeaders(config.apiKey)
		});

		if (!response.ok) {
			if (response.status === 403) {
				logger.debug(`Product ${config.name} meta API blocked (expected CORS behavior)`, { status: response.status });
			} else {
				logger.warn(`Product ${config.name} meta API unavailable`, { status: response.status, url: response.url });
			}
			return null;
		}

		const data = await response.json();
		return data.stratusProductMeta;

	} catch (error) {
		logger.error(`Failed to fetch product ${config.name} metadata`, error);
		return null;
	}
}


export async function ensureProductExists(config: ProductConfig): Promise<string | null> {
	// Check if product already exists
	const existing = await getProductByName(config.name);
	if (existing) {
		return existing.id;
	}

	// Fetch product metadata
	const meta = await fetchProductMeta(config);
	if (!meta) {
		return null;
	}

	// Insert new product
	try {
		const newProducts = await db
			.insert(stratusProducts)
			.values({
				name: meta.name,
				tagline: meta.tagline,
				url: meta.url
			})
			.returning({ id: stratusProducts.id });

		logger.info(`Product added to database: ${config.name}`);
		return newProducts[0].id;

	} catch (error) {
		logger.error(`Failed to create product ${config.name}`, error);
		return null;
	}
}


export async function getAllProducts(): Promise<StratusProduct[]> {
	return await db.select().from(stratusProducts);
}