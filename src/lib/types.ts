//  D A T A B A S E   T Y P E S  ----------------------------------------------------- //

export interface StratusProduct {
	id: string; // UUID from database (required for UI operations)
	name: string; // Product name
	tagline: string; // Product tagline
	url: string; // Product URL
	is_live: boolean; // Whether the product is live and should be synced
}

export type Product = StratusProduct;

export type StratusMetricType =
	| 'user_created'
	| 'download_started'
	| 'subscription_activated'

export interface StratusMetric {
	id?: string;
	source_id?: string;
	event_type: StratusMetricType;
	origin_lat: number;
	origin_long: number;
	city_code: string;
	country_code: string;
	product_id?: string;
	created_at?: string;
}
