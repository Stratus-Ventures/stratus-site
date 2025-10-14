import { json } from '@sveltejs/kit';
import { db, stratusMetrics, logger } from '$lib/server';
import { and, gte, lte, isNotNull, or, eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	try {
		// Get current date
		const now = new Date();
		const currentYear = now.getFullYear();
		const currentMonth = now.getMonth(); // 0-indexed (0 = January)

		// Calculate start and end of current month
		const startOfMonth = new Date(currentYear, currentMonth, 1);
		const endOfMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999);

		logger.info('Fetching globe events', {
			startOfMonth: startOfMonth.toISOString(),
			endOfMonth: endOfMonth.toISOString()
		});

		// Fetch events from current month
		let events = await fetchEventsForPeriod(startOfMonth, endOfMonth);

		// If less than 20 events, try previous months
		let monthsChecked = 0;
		const maxMonthsToCheck = 6; // Don't go back more than 6 months

		while (events.length < 20 && monthsChecked < maxMonthsToCheck) {
			monthsChecked++;

			// Calculate previous month range
			const prevStartOfMonth = new Date(currentYear, currentMonth - monthsChecked, 1);
			const prevEndOfMonth = new Date(
				currentYear,
				currentMonth - monthsChecked + 1,
				0,
				23,
				59,
				59,
				999
			);

			logger.info(`Not enough events (${events.length}), checking previous month`, {
				startOfMonth: prevStartOfMonth.toISOString(),
				endOfMonth: prevEndOfMonth.toISOString()
			});

			const prevMonthEvents = await fetchEventsForPeriod(prevStartOfMonth, prevEndOfMonth);
			events = [...events, ...prevMonthEvents];

			// Stop if we have enough
			if (events.length >= 20) break;
		}

		// Limit to 20 events and shuffle for randomness
		const limitedEvents = shuffleArray(events).slice(0, 20);

		logger.info(`Returning ${limitedEvents.length} globe events`);

		return json(limitedEvents);
	} catch (error) {
		logger.error('Failed to fetch globe events', error);
		return json([], { status: 500 });
	}
};

/**
 * Fetches events for a specific time period
 * Only includes subscriptions and user_created events with valid coordinates
 */
async function fetchEventsForPeriod(startDate: Date, endDate: Date) {
	const events = await db
		.select({
			id: stratusMetrics.id,
			event_type: stratusMetrics.event_type,
			origin_lat: stratusMetrics.origin_lat,
			origin_long: stratusMetrics.origin_long,
			city_code: stratusMetrics.city_code,
			country_code: stratusMetrics.country_code,
			created_at: stratusMetrics.created_at
		})
		.from(stratusMetrics)
		.where(
			and(
				// Only subscriptions and user_created events
				or(
					eq(stratusMetrics.event_type, 'subscription_activated'),
					eq(stratusMetrics.event_type, 'user_created')
				),
				// Only events with valid coordinates
				isNotNull(stratusMetrics.origin_lat),
				isNotNull(stratusMetrics.origin_long),
				// Within time range
				gte(stratusMetrics.created_at, startDate.toISOString()),
				lte(stratusMetrics.created_at, endDate.toISOString())
			)
		)
		.limit(100); // Get up to 100 events per month to have good variety

	// Filter out any events with invalid coordinates (0,0 or extreme values)
	return events.filter((event: { origin_lat: number | null; origin_long: number | null }) => {
		const lat = Number(event.origin_lat);
		const lng = Number(event.origin_long);

		// Check for valid lat/lng ranges
		if (lat === 0 && lng === 0) return false; // Null Island
		if (Math.abs(lat) > 90) return false;
		if (Math.abs(lng) > 180) return false;

		return true;
	});
}

/**
 * Fisher-Yates shuffle algorithm for randomizing array
 */
function shuffleArray<T>(array: T[]): T[] {
	const shuffled = [...array];
	for (let i = shuffled.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
	}
	return shuffled;
}
