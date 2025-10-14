import { writable, derived } from 'svelte/store';
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
const PHOENIX_LNG = -112.0740;
const EVENTS_PER_WEEK = 20;
const ANIMATION_DURATION = 2000; // 2 seconds
const MIN_CYCLE_DELAY = 3000; // 3 seconds minimum between events
const MAX_CYCLE_DELAY = 8000; // 8 seconds maximum between events

// ============================================================================
// STORES
// ============================================================================

// All available events from database (loaded once)
const allEvents = writable<GlobeEvent[]>([]);

// Currently active/animating events
export const activeEvents = writable<AnimatedEvent[]>([]);

// Indices of events that have been shown (to cycle through all before repeating)
const usedEventIndices = writable<Set<number>>(new Set());

// Animation counter for unique IDs
let animationCounter = 0;

// ============================================================================
// EVENT FETCHING
// ============================================================================

/**
 * Fetches exactly 20 random events from the database
 * These will be cycled through randomly to save database calls
 */
export async function loadGlobeEvents(): Promise<void> {
	try {
		const response = await fetch('/api/globe-events');

		if (!response.ok) {
			throw new Error(`Failed to fetch globe events: ${response.statusText}`);
		}

		const data: GlobeEvent[] = await response.json();

		if (data.length > 0) {
			// Take only first 20 events or all if less than 20
			const limitedEvents = data.slice(0, EVENTS_PER_WEEK);
			allEvents.set(limitedEvents);
			console.log(`📊 Loaded ${limitedEvents.length} globe events for visualization`);
		} else {
			console.warn('⚠️ No globe events available');
			allEvents.set([]);
		}
	} catch (error) {
		console.error('❌ Failed to load globe events:', error);
		allEvents.set([]);
	}
}

// ============================================================================
// EVENT SELECTION
// ============================================================================

/**
 * Gets a random event from the available pool
 * Ensures all events are shown before repeating any
 */
function getRandomEvent(events: GlobeEvent[], used: Set<number>): { event: GlobeEvent; index: number } | null {
	if (events.length === 0) return null;

	// If all events have been used, reset the pool
	if (used.size >= events.length) {
		used.clear();
	}

	// Get indices of unused events
	const availableIndices = events
		.map((_, index) => index)
		.filter(index => !used.has(index));

	if (availableIndices.length === 0) return null;

	// Pick random unused event
	const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];

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
 * Starts animating a single event
 * Automatically removes it after ANIMATION_DURATION
 */
async function animateEvent(event: GlobeEvent, usedIndices: Set<number>, eventIndex: number): Promise<void> {
	const animatedEvent = createAnimatedEvent(event);

	// Add to active events
	activeEvents.update(current => [...current, animatedEvent]);

	// Wait for animation duration (2 seconds)
	await new Promise(resolve => setTimeout(resolve, ANIMATION_DURATION));

	// Remove from active events
	activeEvents.update(current =>
		current.filter(e => e.animationId !== animatedEvent.animationId)
	);

	// Mark event as used (will be available again after all events are shown)
	usedEventIndices.update(indices => {
		indices.add(eventIndex);
		return indices;
	});
}

// ============================================================================
// ANIMATION CYCLE
// ============================================================================

/**
 * Main animation loop
 * Continuously picks random events and animates them
 */
export async function startAnimationCycle(): Promise<void> {
	let events: GlobeEvent[] = [];
	let used: Set<number> = new Set();

	// Subscribe to stores
	allEvents.subscribe(value => { events = value; });
	usedEventIndices.subscribe(value => { used = value; });

	while (true) {
		// Wait if no events available
		if (events.length === 0) {
			await new Promise(resolve => setTimeout(resolve, 1000));
			continue;
		}

		// Get a random unused event
		const randomEvent = getRandomEvent(events, used);

		if (randomEvent) {
			// Start animation (non-blocking)
			animateEvent(randomEvent.event, used, randomEvent.index);
		}

		// Random delay before next event (3-8 seconds)
		const delay = MIN_CYCLE_DELAY + Math.random() * (MAX_CYCLE_DELAY - MIN_CYCLE_DELAY);
		await new Promise(resolve => setTimeout(resolve, delay));
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

/**
 * Determines if an event should show an arc (subscriptions only)
 */
export function shouldShowArc(eventType: StratusMetricType): boolean {
	return eventType === 'subscription_activated';
}

/**
 * Determines the visualization type for an event
 */
export function getVisualizationType(eventType: StratusMetricType): 'arc' | 'point' | 'pulse' {
	switch (eventType) {
		case 'subscription_activated':
			return 'arc'; // Arc from location to Phoenix
		case 'user_created':
			return 'point'; // Straight up point
		case 'download_started':
			return 'pulse'; // Straight up point (same as user for now)
		case 'api_calls':
			return 'pulse'; // Pulse effect
		default:
			return 'point';
	}
}
