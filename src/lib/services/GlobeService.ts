import { writable } from 'svelte/store';
import type { StratusMetricType } from '$lib/types';

// ============================================================================
// TYPES
// ============================================================================

export interface GlobeEvent {
	id: string;
	event_type: StratusMetricType;
	origin_lat: number;
	origin_long: number;
	city_code: string;
	country_code: string;
	created_at?: string;
}

export interface AnimatedEvent extends GlobeEvent {
	animationId: string;
	startTime: number;
	isAnimating: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const PHOENIX_LAT = 33.4484;
const PHOENIX_LNG = -112.074;
const EVENTS_PER_MONTH = 20;
const ANIMATION_DURATION = 6500; // 6.5 seconds total (rise 1.5s + hold 3.5s + fall 1.5s)
const MIN_CYCLE_DELAY = 1500; // 1.5 seconds minimum between events
const MAX_CYCLE_DELAY = 3500; // 3.5 seconds maximum between events
const MAX_ARCS = 2; // Max simultaneous subscription arcs
const MAX_POINTS = 5; // Max simultaneous user points (increased from 3)
const MAX_TOTAL_EVENTS = 7; // Max total simultaneous events (increased from 3)
const MIN_INITIAL_EVENTS = 3; // Start with at least 3 events

// ============================================================================
// FALLBACK TEST DATA
// ============================================================================

const FALLBACK_EVENTS: GlobeEvent[] = [
	{
		id: 'test-1',
		event_type: 'user_created',
		origin_lat: 51.5074,
		origin_long: -0.1278,
		city_code: 'LON',
		country_code: 'GBR'
	},
	{
		id: 'test-2',
		event_type: 'subscription_activated',
		origin_lat: 40.7128,
		origin_long: -74.006,
		city_code: 'NYC',
		country_code: 'USA'
	},
	{
		id: 'test-3',
		event_type: 'user_created',
		origin_lat: 35.6762,
		origin_long: 139.6503,
		city_code: 'TYO',
		country_code: 'JPN'
	},
	{
		id: 'test-4',
		event_type: 'subscription_activated',
		origin_lat: 48.8566,
		origin_long: 2.3522,
		city_code: 'PAR',
		country_code: 'FRA'
	},
	{
		id: 'test-5',
		event_type: 'user_created',
		origin_lat: -33.8688,
		origin_long: 151.2093,
		city_code: 'SYD',
		country_code: 'AUS'
	},
	{
		id: 'test-6',
		event_type: 'subscription_activated',
		origin_lat: 52.52,
		origin_long: 13.405,
		city_code: 'BER',
		country_code: 'DEU'
	},
	{
		id: 'test-7',
		event_type: 'user_created',
		origin_lat: 37.7749,
		origin_long: -122.4194,
		city_code: 'SFO',
		country_code: 'USA'
	},
	{
		id: 'test-8',
		event_type: 'subscription_activated',
		origin_lat: 55.7558,
		origin_long: 37.6173,
		city_code: 'MOW',
		country_code: 'RUS'
	},
	{
		id: 'test-9',
		event_type: 'user_created',
		origin_lat: 19.4326,
		origin_long: -99.1332,
		city_code: 'MEX',
		country_code: 'MEX'
	},
	{
		id: 'test-10',
		event_type: 'subscription_activated',
		origin_lat: 1.3521,
		origin_long: 103.8198,
		city_code: 'SIN',
		country_code: 'SGP'
	},
	{
		id: 'test-11',
		event_type: 'user_created',
		origin_lat: -23.5505,
		origin_long: -46.6333,
		city_code: 'SAO',
		country_code: 'BRA'
	},
	{
		id: 'test-12',
		event_type: 'subscription_activated',
		origin_lat: 59.3293,
		origin_long: 18.0686,
		city_code: 'STO',
		country_code: 'SWE'
	},
	{
		id: 'test-13',
		event_type: 'user_created',
		origin_lat: 41.9028,
		origin_long: 12.4964,
		city_code: 'ROM',
		country_code: 'ITA'
	},
	{
		id: 'test-14',
		event_type: 'subscription_activated',
		origin_lat: 28.6139,
		origin_long: 77.209,
		city_code: 'DEL',
		country_code: 'IND'
	},
	{
		id: 'test-15',
		event_type: 'user_created',
		origin_lat: 50.1109,
		origin_long: 8.6821,
		city_code: 'FRA',
		country_code: 'DEU'
	},
	{
		id: 'test-16',
		event_type: 'subscription_activated',
		origin_lat: -34.6037,
		origin_long: -58.3816,
		city_code: 'BUE',
		country_code: 'ARG'
	},
	{
		id: 'test-17',
		event_type: 'user_created',
		origin_lat: 22.3964,
		origin_long: 114.1095,
		city_code: 'HKG',
		country_code: 'HKG'
	},
	{
		id: 'test-18',
		event_type: 'subscription_activated',
		origin_lat: 25.2048,
		origin_long: 55.2708,
		city_code: 'DXB',
		country_code: 'ARE'
	},
	{
		id: 'test-19',
		event_type: 'user_created',
		origin_lat: 43.6532,
		origin_long: -79.3832,
		city_code: 'YYZ',
		country_code: 'CAN'
	},
	{
		id: 'test-20',
		event_type: 'subscription_activated',
		origin_lat: 39.9042,
		origin_long: 116.4074,
		city_code: 'PEK',
		country_code: 'CHN'
	},
	// Additional globally diverse locations
	{
		id: 'test-21',
		event_type: 'user_created',
		origin_lat: -26.2041,
		origin_long: 28.0473,
		city_code: 'JNB',
		country_code: 'ZAF'
	},
	{
		id: 'test-22',
		event_type: 'subscription_activated',
		origin_lat: 30.0444,
		origin_long: 31.2357,
		city_code: 'CAI',
		country_code: 'EGY'
	},
	{
		id: 'test-23',
		event_type: 'user_created',
		origin_lat: 6.5244,
		origin_long: 3.3792,
		city_code: 'LOS',
		country_code: 'NGA'
	},
	{
		id: 'test-24',
		event_type: 'subscription_activated',
		origin_lat: -1.2921,
		origin_long: 36.8219,
		city_code: 'NBO',
		country_code: 'KEN'
	},
	{
		id: 'test-25',
		event_type: 'user_created',
		origin_lat: 33.8869,
		origin_long: 9.5375,
		city_code: 'TUN',
		country_code: 'TUN'
	},
	{
		id: 'test-26',
		event_type: 'subscription_activated',
		origin_lat: -17.8252,
		origin_long: 31.0335,
		city_code: 'HRE',
		country_code: 'ZWE'
	},
	{
		id: 'test-27',
		event_type: 'user_created',
		origin_lat: 12.9716,
		origin_long: 77.5946,
		city_code: 'BLR',
		country_code: 'IND'
	},
	{
		id: 'test-28',
		event_type: 'subscription_activated',
		origin_lat: 21.0285,
		origin_long: 105.8542,
		city_code: 'HAN',
		country_code: 'VNM'
	},
	{
		id: 'test-29',
		event_type: 'user_created',
		origin_lat: 3.139,
		origin_long: 101.6869,
		city_code: 'KUL',
		country_code: 'MYS'
	},
	{
		id: 'test-30',
		event_type: 'subscription_activated',
		origin_lat: 14.5995,
		origin_long: 120.9842,
		city_code: 'MNL',
		country_code: 'PHL'
	},
	{
		id: 'test-31',
		event_type: 'user_created',
		origin_lat: -6.2088,
		origin_long: 106.8456,
		city_code: 'JKT',
		country_code: 'IDN'
	},
	{
		id: 'test-32',
		event_type: 'subscription_activated',
		origin_lat: 13.7563,
		origin_long: 100.5018,
		city_code: 'BKK',
		country_code: 'THA'
	},
	{
		id: 'test-33',
		event_type: 'user_created',
		origin_lat: 35.6895,
		origin_long: 51.3890,
		city_code: 'THR',
		country_code: 'IRN'
	},
	{
		id: 'test-34',
		event_type: 'subscription_activated',
		origin_lat: 41.0082,
		origin_long: 28.9784,
		city_code: 'IST',
		country_code: 'TUR'
	},
	{
		id: 'test-35',
		event_type: 'user_created',
		origin_lat: 31.7683,
		origin_long: 35.2137,
		city_code: 'JRS',
		country_code: 'ISR'
	},
	{
		id: 'test-36',
		event_type: 'subscription_activated',
		origin_lat: 64.1466,
		origin_long: -21.9426,
		city_code: 'REK',
		country_code: 'ISL'
	},
	{
		id: 'test-37',
		event_type: 'user_created',
		origin_lat: 60.1699,
		origin_long: 24.9384,
		city_code: 'HEL',
		country_code: 'FIN'
	},
	{
		id: 'test-38',
		event_type: 'subscription_activated',
		origin_lat: 47.4979,
		origin_long: 19.0402,
		city_code: 'BUD',
		country_code: 'HUN'
	},
	{
		id: 'test-39',
		event_type: 'user_created',
		origin_lat: 50.0755,
		origin_long: 14.4378,
		city_code: 'PRG',
		country_code: 'CZE'
	},
	{
		id: 'test-40',
		event_type: 'subscription_activated',
		origin_lat: -41.2865,
		origin_long: 174.7762,
		city_code: 'WLG',
		country_code: 'NZL'
	}
];

// ============================================================================
// STORES
// ============================================================================

// All available events from database (loaded once)
const allEvents = writable<GlobeEvent[]>([]);

// Currently active/animating events
export const activeEvents = writable<AnimatedEvent[]>([]);

// Indices of events that have been shown (to cycle through all before repeating)
const usedEventIndices = writable<Set<number>>(new Set());

// Recent event locations to prevent clustering (stores last 3 event coordinates)
const recentEventLocations = writable<Array<{lat: number, lng: number, timestamp: number}>>([]);

// Animation counter for unique IDs
let animationCounter = 0;

// ============================================================================
// EVENT FETCHING
// ============================================================================

/**
 * Randomizes event types for more dynamic visualization
 * 60% user_created, 40% subscription_activated
 */
function randomizeEventTypes(events: GlobeEvent[]): GlobeEvent[] {
	return events.map(event => ({
		...event,
		event_type: Math.random() < 0.6 ? 'user_created' : 'subscription_activated'
	}));
}

/**
 * Loads random diverse events from test data
 * Randomizes and removes duplicates at same coordinates
 * Optimized for performance with early returns
 */
export async function loadGlobeEvents(): Promise<void> {
	// Use random diverse geo locations (future-proofed for real data later)
	// Pre-filter, shuffle, and randomize event types for better performance
	const baseEvents = shuffleArray(removeDuplicateCoordinates([...FALLBACK_EVENTS]));
	const randomizedEvents = randomizeEventTypes(baseEvents);
	// Using diverse random events for globe visualization
	allEvents.set(randomizedEvents);
}

/**
 * Removes events with duplicate coordinates (keeps first occurrence)
 */
function removeDuplicateCoordinates(events: GlobeEvent[]): GlobeEvent[] {
	const seen = new Set<string>();
	return events.filter((event) => {
		// Create coordinate key (rounded to 2 decimals to catch near-duplicates)
		const key = `${event.origin_lat.toFixed(2)},${event.origin_long.toFixed(2)}`;
		if (seen.has(key)) {
			return false;
		}
		seen.add(key);
		return true;
	});
}

/**
 * Fisher-Yates shuffle for randomizing array
 */
function shuffleArray<T>(array: T[]): T[] {
	const shuffled = [...array];
	for (let i = shuffled.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
	}
	return shuffled;
}

// ============================================================================
// EVENT SELECTION
// ============================================================================

/**
 * Calculates the distance between two geographic points in degrees
 */
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
	const deltaLat = lat1 - lat2;
	const deltaLng = lng1 - lng2;
	return Math.sqrt(deltaLat * deltaLat + deltaLng * deltaLng);
}

/**
 * Gets a random event from the available pool with geographic diversity
 * Ensures all events are shown before repeating any
 * Prevents clustering by avoiding locations too close to recent events
 * Optimized with early returns for performance
 */
function getRandomEvent(
	events: GlobeEvent[],
	used: Set<number>,
	recentLocations: Array<{lat: number, lng: number, timestamp: number}> = []
): { event: GlobeEvent; index: number } | null {
	// Early return for empty events
	if (events.length === 0) return null;

	// If all events have been used, reset the pool - performance optimization
	if (used.size >= events.length) {
		used.clear();
	}

	// Get indices of unused events
	const availableIndices = events.map((_, index) => index).filter((index) => !used.has(index));

	if (availableIndices.length === 0) return null;

	// Filter out events too close to recent locations (within ~15 degrees)
	const MIN_DISTANCE = 15; // Minimum distance in degrees to prevent clustering
	const diverseIndices = availableIndices.filter(index => {
		const event = events[index];
		return recentLocations.every(recent => 
			calculateDistance(event.origin_lat, event.origin_long, recent.lat, recent.lng) >= MIN_DISTANCE
		);
	});

	// Use diverse indices if available, otherwise fall back to all available
	const candidateIndices = diverseIndices.length > 0 ? diverseIndices : availableIndices;

	// Pick random event from candidates
	const randomIndex = candidateIndices[Math.floor(Math.random() * candidateIndices.length)];

	return { event: events[randomIndex], index: randomIndex };
}

// ============================================================================
// ANIMATION MANAGEMENT
// ============================================================================

/**
 * Creates an animated event wrapper
 */
function createAnimatedEvent(event: GlobeEvent): AnimatedEvent {
	return {
		...event,
		animationId: `anim-${animationCounter++}`,
		startTime: Date.now(),
		isAnimating: true
	};
}

/**
 * Counts current active events by type
 */
function getCurrentEventCounts(events: AnimatedEvent[]): {
	arcs: number;
	points: number;
	total: number;
} {
	let arcs = 0;
	let points = 0;

	for (const event of events) {
		if (event.event_type === 'subscription_activated') {
			arcs++;
		} else if (event.event_type === 'user_created') {
			points++;
		}
	}

	return { arcs, points, total: events.length };
}

/**
 * Checks if we can add a new event based on current limits
 */
function canAddEvent(currentEvents: AnimatedEvent[], newEventType: StratusMetricType): boolean {
	const counts = getCurrentEventCounts(currentEvents);

	// Check total limit
	if (counts.total >= MAX_TOTAL_EVENTS) return false;

	// Check type-specific limits
	if (newEventType === 'subscription_activated' && counts.arcs >= MAX_ARCS) {
		return false;
	}

	if (newEventType === 'user_created' && counts.points >= MAX_POINTS) {
		return false;
	}

	return true;
}

/**
 * Starts animating a single event
 * Automatically removes it after ANIMATION_DURATION (9 seconds for ping-pong)
 * Tracks recent locations to prevent clustering
 */
async function animateEvent(
	event: GlobeEvent,
	usedIndices: Set<number>,
	eventIndex: number
): Promise<void> {
	const animatedEvent = createAnimatedEvent(event);

	// Add to active events
	activeEvents.update((current) => [...current, animatedEvent]);

	// Track this location to prevent clustering
	recentEventLocations.update((locations) => {
		const newLocation = {
			lat: event.origin_lat,
			lng: event.origin_long,
			timestamp: Date.now()
		};
		
		// Keep only the last 3 locations (within 3 event iterations)
		const updatedLocations = [...locations, newLocation].slice(-3);
		return updatedLocations;
	});

	// Wait for animation duration (9 seconds: rise 2s + hold 5s + fall 2s)
	await new Promise((resolve) => setTimeout(resolve, ANIMATION_DURATION));

	// Remove from active events
	activeEvents.update((current) =>
		current.filter((e) => e.animationId !== animatedEvent.animationId)
	);

	// Mark event as used (will be available again after all events are shown)
	usedEventIndices.update((indices) => {
		indices.add(eventIndex);
		return indices;
	});
}

// ============================================================================
// ANIMATION CYCLE
// ============================================================================

/**
 * Main animation loop
 * Starts with 2-3 events, then continuously cycles through remaining events
 * Respects max limits: 2 arcs, 3 user points, 3 total events
 */
export async function startAnimationCycle(): Promise<void> {
	let events: GlobeEvent[] = [];
	let used: Set<number> = new Set();
	let current: AnimatedEvent[] = [];
	let recentLocations: Array<{lat: number, lng: number, timestamp: number}> = [];

	// Subscribe to stores
	allEvents.subscribe((value) => {
		events = value;
	});
	usedEventIndices.subscribe((value) => {
		used = value;
	});
	activeEvents.subscribe((value) => {
		current = value;
	});
	recentEventLocations.subscribe((value) => {
		recentLocations = value;
	});

	// Wait for events to load
	while (events.length === 0) {
		await new Promise((resolve) => setTimeout(resolve, 100));
	}

	// Start with 2-3 initial events with geographic diversity
	const initialEventCount = MIN_INITIAL_EVENTS + Math.floor(Math.random() * 2); // 2 or 3
	for (let i = 0; i < initialEventCount && i < events.length; i++) {
		const randomEvent = getRandomEvent(events, used, recentLocations);
		if (randomEvent && canAddEvent(current, randomEvent.event.event_type)) {
			animateEvent(randomEvent.event, used, randomEvent.index);
			// Small delay between initial events
			await new Promise((resolve) => setTimeout(resolve, 500));
		}
	}

	// Main animation loop with geographic diversity
	while (true) {
		// Get a random unused event with geographic diversity
		const randomEvent = getRandomEvent(events, used, recentLocations);

		if (randomEvent) {
			// Check if we can add this event type
			if (canAddEvent(current, randomEvent.event.event_type)) {
				// Start animation (non-blocking)
				animateEvent(randomEvent.event, used, randomEvent.index);
			}
		}

		// Random delay before next event (2-5 seconds)
		const delay = MIN_CYCLE_DELAY + Math.random() * (MAX_CYCLE_DELAY - MIN_CYCLE_DELAY);
		await new Promise((resolve) => setTimeout(resolve, delay));
	}
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Gets Phoenix coordinates (home base for subscription arcs)
 */
export function getPhoenixCoords(): { lat: number; lng: number } {
	return { lat: PHOENIX_LAT, lng: PHOENIX_LNG };
}
