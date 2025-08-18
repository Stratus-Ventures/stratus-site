import { 
	pgTable, 
	text, 
	numeric,
	timestamp, 
	pgEnum,
	varchar,
	pgView,
	uuid
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';



// C U S T O M   T Y P E S --------------------------------------------------------- //

export const stratusMetricsEnum = pgEnum('stratus_metric_type', [
	'user_created', 
	'download_started', 
	'subscription_activated'
]);



// T A B L E   D E F E N I T I O N S ----------------------------------------------- //

export const stratusProducts = pgTable('stratus_products', {
	id: uuid("id").primaryKey().defaultRandom(),
	name: text().notNull(),
	tagline: text().notNull(),
	url: text().notNull()
})
.enableRLS();


export const stratusMetrics = pgTable('stratus_metrics', {
	id: uuid("id").primaryKey().defaultRandom(),
	event_type: stratusMetricsEnum().notNull(),
	origin_lat: numeric({ precision: 7, scale: 4 }).notNull(),
	origin_long: numeric({ precision: 7, scale: 4 }).notNull(),
	city_code: varchar({ length: 3 }).notNull(),
	country_code: varchar({ length: 3 }).notNull(),
	from_product: uuid('product_id').notNull().references(() => stratusProducts.id),
	created_at: timestamp({ withTimezone: true, mode: 'string' }).defaultNow().notNull()
})
.enableRLS();



// V I E W S ----------------------------------------------------------------------- //

export const totalEventCount = pgView('totalEventCount')
.with({
	securityInvoker: true,
})
.as((qb) => qb
	.select({
		user_created_total: 
			sql`count(*) filter (where ${stratusMetrics.event_type} = 'user_created')`
			.as('user_created_total'),
		download_started_total: 
			sql`count(*) filter (where ${stratusMetrics.event_type} = 'download_started')`
			.as('download_started_total'),
		subscription_activated_total: 
			sql`count(*) filter (where ${stratusMetrics.event_type} = 'subscription_activated')`
			.as('subscription_activated_total')
	})
	.from(stratusMetrics)
);	