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

//  C U S T O M   T Y P E S  --------------------------------------------------------- //

export const stratusMetricEnum = pgEnum('stratus_metric_type', [
	'user_created',
	'download_started',
	'subscription_activated'
]);

//  T A B L E   D E F E N I T I O N S  ----------------------------------------------- //

export const stratusProducts = pgTable('stratus_products', {
	id: uuid().primaryKey().defaultRandom(),
	name: text().notNull().unique(),
	tagline: text().notNull(),
	url: text().notNull()
}).enableRLS();

export const stratusMetrics = pgTable('stratus_metrics', {
	id: text().primaryKey(),
	event_type: stratusMetricEnum().notNull(),
	origin_lat: numeric({ precision: 7, scale: 4 }).$type<number>().notNull(),
	origin_long: numeric({ precision: 7, scale: 4 }).$type<number>().notNull(),
	city_code: varchar({ length: 3 }).notNull(),
	country_code: varchar({ length: 3 }).notNull(),
	product_name: text()
		.notNull()
		.references(() => stratusProducts.name),
	source_id: text().notNull(),
	created_at: timestamp({ withTimezone: true, mode: 'string' }).defaultNow().notNull()
}).enableRLS();

//  H E L P E R   F U N C T I O N S  ------------------------------------------------- //

const formatTitleCase = (text: string): string => {
	return text
		.split(' ')
		.map((word) => {
			if (word.length === 0) return word;
			// Only capitalize first letter, keep rest as-is to preserve existing caps like "AI"
			return word.charAt(0).toUpperCase() + word.slice(1);
		})
		.join(' ');
};

export const getFormattedProducts = async (db: any) => {
	const products = await db.select().from(stratusProducts).orderBy(stratusProducts.name);

	return products.map((product: any) => ({
		...product,
		name: formatTitleCase(product.name || ''),
		tagline: formatTitleCase(product.tagline || '')
	}));
};

//  V I E W S  ----------------------------------------------------------------------- //

export const totalEventCount = pgView('totalEventCount')
	.with({
		securityInvoker: true
	})
	.as((qb) =>
		qb
			.select({
				user_created_total:
					sql`count(*) filter (where ${stratusMetrics.event_type} = 'user_created')`.as(
						'user_created_total'
					),
				download_started_total:
					sql`count(*) filter (where ${stratusMetrics.event_type} = 'download_started')`.as(
						'download_started_total'
					),
				subscription_activated_total:
					sql`count(*) filter (where ${stratusMetrics.event_type} = 'subscription_activated')`.as(
						'subscription_activated_total'
					)
			})
			.from(stratusMetrics)
	);
