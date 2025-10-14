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
const TOTAL_EVENTS = 40; // Total number of random events to generate
const ANIMATION_DURATION = 6500; // 6.5 seconds total (rise 1.5s + hold 3.5s + fall 1.5s)
const MIN_CYCLE_DELAY = 1800; // Faster cycling for more events
const MAX_CYCLE_DELAY = 3000; // Faster cycling for more events
const MIN_SIMULTANEOUS_EVENTS = 3; // Minimum events visible at any time
const MAX_SIMULTANEOUS_EVENTS = 10; // Maximum events visible at any time
const MIN_INITIAL_EVENTS = 3; // Start with at least 3 events

// ============================================================================
// RANDOM EVENT GENERATION
// ============================================================================

// Major cities for realistic event locations
const MAJOR_CITIES = [
	{ lat: 51.5074, lng: -0.1278, code: 'LON', country: 'GBR' }, // London
	{ lat: 40.7128, lng: -74.006, code: 'NYC', country: 'USA' }, // New York
	{ lat: 35.6762, lng: 139.6503, code: 'TYO', country: 'JPN' }, // Tokyo
	{ lat: 48.8566, lng: 2.3522, code: 'PAR', country: 'FRA' }, // Paris
	{ lat: -33.8688, lng: 151.2093, code: 'SYD', country: 'AUS' }, // Sydney
	{ lat: 52.52, lng: 13.405, code: 'BER', country: 'DEU' }, // Berlin
	{ lat: 37.7749, lng: -122.4194, code: 'SFO', country: 'USA' }, // San Francisco
	{ lat: 55.7558, lng: 37.6173, code: 'MOW', country: 'RUS' }, // Moscow
	{ lat: 19.4326, lng: -99.1332, code: 'MEX', country: 'MEX' }, // Mexico City
	{ lat: 1.3521, lng: 103.8198, code: 'SIN', country: 'SGP' }, // Singapore
	{ lat: -23.5505, lng: -46.6333, code: 'SAO', country: 'BRA' }, // São Paulo
	{ lat: 59.3293, lng: 18.0686, code: 'STO', country: 'SWE' }, // Stockholm
	{ lat: 25.2048, lng: 55.2708, code: 'DXB', country: 'ARE' }, // Dubai
	{ lat: 39.9042, lng: 116.4074, code: 'PEK', country: 'CHN' }, // Beijing
	{ lat: 28.6139, lng: 77.209, code: 'DEL', country: 'IND' }, // Delhi
	{ lat: -26.2041, lng: 28.0473, code: 'JNB', country: 'ZAF' }, // Johannesburg
	{ lat: 45.4642, lng: 9.19, code: 'MIL', country: 'ITA' }, // Milan
	{ lat: 41.9028, lng: 12.4964, code: 'ROM', country: 'ITA' }, // Rome
	{ lat: 50.1109, lng: 8.6821, code: 'FRA', country: 'DEU' }, // Frankfurt
	{ lat: 43.6532, lng: -79.3832, code: 'YYZ', country: 'CAN' }, // Toronto
	{ lat: 49.2827, lng: -123.1207, code: 'YVR', country: 'CAN' }, // Vancouver
	{ lat: 34.0522, lng: -118.2437, code: 'LAX', country: 'USA' }, // Los Angeles
	{ lat: 41.8781, lng: -87.6298, code: 'CHI', country: 'USA' }, // Chicago
	{ lat: 29.7604, lng: -95.3698, code: 'HOU', country: 'USA' }, // Houston
	{ lat: 25.7617, lng: -80.1918, code: 'MIA', country: 'USA' }, // Miami
	{ lat: 47.6062, lng: -122.3321, code: 'SEA', country: 'USA' }, // Seattle
	{ lat: 39.7392, lng: -104.9903, code: 'DEN', country: 'USA' }, // Denver
	{ lat: 32.7767, lng: -96.797, code: 'DFW', country: 'USA' }, // Dallas
	{ lat: 33.7490, lng: -84.3880, code: 'ATL', country: 'USA' }, // Atlanta
	{ lat: 42.3601, lng: -71.0589, code: 'BOS', country: 'USA' }, // Boston
	{ lat: 38.9072, lng: -77.0369, code: 'DCA', country: 'USA' }, // Washington DC
	{ lat: 39.2904, lng: -76.6122, code: 'BWI', country: 'USA' }, // Baltimore
	{ lat: 40.6892, lng: -74.1745, code: 'EWR', country: 'USA' }, // Newark
	{ lat: 26.0742, lng: -80.1506, code: 'FLL', country: 'USA' }, // Fort Lauderdale
	{ lat: 36.1627, lng: -86.7816, code: 'BNA', country: 'USA' }, // Nashville
	{ lat: 35.2271, lng: -80.8431, code: 'CLT', country: 'USA' }, // Charlotte
	{ lat: 30.1945, lng: -95.3414, code: 'IAH', country: 'USA' }, // Houston Intercontinental
	{ lat: 21.3099, lng: -157.8581, code: 'HNL', country: 'USA' }, // Honolulu
	{ lat: 61.2181, lng: -149.9003, code: 'ANC', country: 'USA' }, // Anchorage
	{ lat: 64.0685, lng: -21.9426, code: 'KEF', country: 'ISL' }, // Reykjavik
];

const EVENT_TYPES: StratusMetricType[] = [
	'user_created',
	'download_started', 
	'subscription_activated',
	'api_calls'
];

/**
 * Generates completely random events for globe visualization
 */
function generateRandomEvents(count: number): GlobeEvent[] {
	const events: GlobeEvent[] = [];
	
	for (let i = 0; i < count; i++) {
		// Pick a random city
		const city = MAJOR_CITIES[Math.floor(Math.random() * MAJOR_CITIES.length)];
		
		// Pick a random event type
		const eventType = EVENT_TYPES[Math.floor(Math.random() * EVENT_TYPES.length)];
		
		// Add some random variation to coordinates (±0.5 degrees for variety)
		const latVariation = (Math.random() - 0.5) * 1.0;
		const lngVariation = (Math.random() - 0.5) * 1.0;
		
		events.push({
			id: `random-${i + 1}`,
			event_type: eventType,
			origin_lat: city.lat + latVariation,
			origin_long: city.lng + lngVariation,
			city_code: city.code,
			country_code: city.country,
			created_at: new Date().toISOString()
		});
	}
	
	return events;
}

// Generate 40 completely random events
const FALLBACK_EVENTS: GlobeEvent[] = generateRandomEvents(TOTAL_EVENTS);

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
 * Checks if we can add a new event based on current limits (3-10 total events)
 */
function canAddEvent(currentEvents: AnimatedEvent[], newEventType: StratusMetricType): boolean {
	const counts = getCurrentEventCounts(currentEvents);

	// Always allow if we're below minimum
	if (counts.total < MIN_SIMULTANEOUS_EVENTS) return true;

	// Check maximum limit
	if (counts.total >= MAX_SIMULTANEOUS_EVENTS) return false;

	// Balanced distribution - limit each type to prevent one type dominating
	const maxPerType = Math.ceil(MAX_SIMULTANEOUS_EVENTS / EVENT_TYPES.length);
	
	if (newEventType === 'subscription_activated' && counts.arcs >= maxPerType) {
		return false;
	}

	if ((newEventType === 'user_created' || newEventType === 'download_started' || newEventType === 'api_calls') 
		&& counts.points >= maxPerType * 3) { // Points can be more numerous
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

	// Start with 3-5 initial events with geographic diversity
	const initialEventCount = MIN_INITIAL_EVENTS + Math.floor(Math.random() * 3); // 3, 4, or 5
	for (let i = 0; i < initialEventCount && i < events.length; i++) {
		const randomEvent = getRandomEvent(events, used, recentLocations);
		if (randomEvent && canAddEvent(current, randomEvent.event.event_type)) {
			animateEvent(randomEvent.event, used, randomEvent.index);
			// Small delay between initial events
			await new Promise((resolve) => setTimeout(resolve, 500));
		}
	}

	// Main animation loop - maintain 3-10 events at all times
	while (true) {
		const currentCount = current.length;
		
		// If below minimum, add events more aggressively
		if (currentCount < MIN_SIMULTANEOUS_EVENTS) {
			const eventsToAdd = MIN_SIMULTANEOUS_EVENTS - currentCount;
			for (let i = 0; i < eventsToAdd; i++) {
				const randomEvent = getRandomEvent(events, used, recentLocations);
				if (randomEvent && canAddEvent(current, randomEvent.event.event_type)) {
					animateEvent(randomEvent.event, used, randomEvent.index);
					await new Promise((resolve) => setTimeout(resolve, 200)); // Quick succession
				}
			}
		}
		// Normal operation - add events as space allows
		else {
			const randomEvent = getRandomEvent(events, used, recentLocations);
			if (randomEvent && canAddEvent(current, randomEvent.event.event_type)) {
				animateEvent(randomEvent.event, used, randomEvent.index);
			}
		}

		// Adaptive delay - shorter when we need more events, longer when we have enough
		const baseDelay = currentCount < MIN_SIMULTANEOUS_EVENTS ? MIN_CYCLE_DELAY : MAX_CYCLE_DELAY;
		const delay = baseDelay + Math.random() * (MAX_CYCLE_DELAY - MIN_CYCLE_DELAY);
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
