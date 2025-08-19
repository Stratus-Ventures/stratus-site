import { db } from '$lib/server/db/index';
import { stratusProducts, stratusMetrics } from '$lib/server/db/schema';
import { env } from '$env/dynamic/private';
import { eq } from 'drizzle-orm';

// Configuration for all Stratus products
const PRODUCTS = [
	{
		name: 'clovis',
		apiUrl: env.CLOVIS_API_URL,
		apiKey: env.CLOVIS_API_KEY
	},
	{
		name: 'numa',
		apiUrl: env.NUMA_API_URL,
		apiKey: env.NUMA_API_KEY
	}
];

interface ProductMeta {
	name: string;
	tagline: string;
	url: string;
}

interface ProductEvent {
	id: string;
	event_type: 'user_created' | 'download_started' | 'subscription_activated';
	origin_lat: string;
	origin_long: string;
	city_code: string;
	country_code: string;
}

// Fetch product metadata and ensure it exists in database (only insert once)
async function ensureProductExists(productConfig: typeof PRODUCTS[0]): Promise<string | null> {
	if (!productConfig.apiUrl || !productConfig.apiKey) {
		console.warn(`Missing API configuration for ${productConfig.name}`);
		return null;
	}

	try {
		// Check if product already exists in database
		const existingProduct = await db
			.select()
			.from(stratusProducts)
			.where(eq(stratusProducts.name, productConfig.name))
			.limit(1);

		if (existingProduct.length > 0) {
			console.log(`Product ${productConfig.name} already exists in database`);
			return existingProduct[0].id;
		}

		// Fetch product metadata from API
		const response = await fetch(`${productConfig.apiUrl}/stratus-product-meta`, {
			headers: {
				'clovis-api-key': productConfig.apiKey,
				'Origin': 'https://stratus-ventures.org'
			}
		});

		if (!response.ok) {
			console.error(`Failed to fetch metadata for ${productConfig.name}: ${response.status}`);
			return null;
		}

		const data = await response.json();
		const productMeta: ProductMeta = data.stratusProductMeta;

		// Insert new product into database
		const newProduct = await db
			.insert(stratusProducts)
			.values({
				name: productMeta.name,
				tagline: productMeta.tagline,
				url: productMeta.url
			})
			.returning({ id: stratusProducts.id });

		console.log(`Successfully added product ${productConfig.name} to database`);
		return newProduct[0].id;

	} catch (error) {
		console.error(`Error ensuring product ${productConfig.name} exists:`, error);
		return null;
	}
}

// Fetch events for a specific product and insert them into database
async function fetchAndInsertEvents(productConfig: typeof PRODUCTS[0], productId: string): Promise<void> {
	if (!productConfig.apiUrl || !productConfig.apiKey) {
		console.warn(`Missing API configuration for ${productConfig.name}`);
		return;
	}

	try {
		const response = await fetch(`${productConfig.apiUrl}/stratus-product-events`, {
			headers: {
				'clovis-api-key': productConfig.apiKey,
				'Origin': 'https://stratus-ventures.org'
			}
		});

		if (!response.ok) {
			console.error(`Failed to fetch events for ${productConfig.name}: ${response.status}`);
			return;
		}

		const data = await response.json();
		const events: ProductEvent[] = data.stratusProductEvents;

		if (!events || events.length === 0) {
			console.log(`No events found for product ${productConfig.name}`);
			return;
		}

		// Insert events into database
		const eventsToInsert = events.map(event => ({
			event_type: event.event_type,
			origin_lat: event.origin_lat,
			origin_long: event.origin_long,
			city_code: event.city_code,
			country_code: event.country_code,
			from_product: productId
		}));

		await db.insert(stratusMetrics).values(eventsToInsert);
		console.log(`Successfully inserted ${events.length} events for product ${productConfig.name}`);

	} catch (error) {
		console.error(`Error fetching events for product ${productConfig.name}:`, error);
	}
}

// Main function to fetch all product data and sync to database
export async function syncAllProductData(): Promise<void> {
	console.log('Starting sync of all product data...');

	for (const product of PRODUCTS) {
		console.log(`Processing product: ${product.name}`);
		
		// Ensure product exists in database (only insert once)
		const productId = await ensureProductExists(product);
		
		if (productId) {
			// Fetch and insert events for this product
			await fetchAndInsertEvents(product, productId);
		} else {
			console.warn(`Skipping events sync for ${product.name} - product not available`);
		}
	}

	console.log('Completed sync of all product data');
}

// Function to get all products from database
export async function getAllProducts() {
	return await db.select().from(stratusProducts);
}

// Function to get all metrics from database
export async function getAllMetrics() {
	return await db.select().from(stratusMetrics);
}