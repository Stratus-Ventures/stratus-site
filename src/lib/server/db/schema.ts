import { 
	pgTable, 
	serial,
	text, 
	numeric,
	integer,
	timestamp, 
	pgEnum,
} from 'drizzle-orm/pg-core';



// C U S T O M   T Y P E S --------------------------------------------------------- //

export const stratusMetricsEnum = pgEnum('stratus_metric_type', [
	'user_created', 
	'download_started', 
	'subscription_activated'
]);



// T A B L E   D E F E N I T I O N S ----------------------------------------------- //

export const stratusProducts = pgTable('stratus_products', {
	id: serial().primaryKey(),
	name: text().notNull(),
	tagline: text().notNull(),
	url: text().notNull()
}).enableRLS();



export const stratusMetrics = pgTable('stratus_metrics', {
	id: serial().primaryKey(),
	event_type: stratusMetricsEnum().notNull(),
	origin_lat: numeric({ precision: 7, scale: 4 }).notNull(),
	origin_long: numeric({ precision: 7, scale: 4 }).notNull(),
	from_product: integer('product_id').notNull().references(() => stratusProducts.id),
	created_at: timestamp({ withTimezone: true, mode: 'string' }).defaultNow().notNull()
}).enableRLS();