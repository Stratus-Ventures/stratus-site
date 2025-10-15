import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { goto } from '$app/navigation';

//  A U T H   S T O R E  ------------------------------------------------------------- //

interface AuthState {
	isAuthenticated: boolean;
	timestamp: number | null;
}

const STORAGE_KEY = 'stratus_auth_state';

// Load initial state from localStorage if in browser
const loadStoredState = (): AuthState => {
	const defaultState: AuthState = {
		isAuthenticated: false,
		timestamp: null
	};

	if (!browser) {
		return defaultState;
	}

	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (!stored) {
			return defaultState;
		}

		const parsed = JSON.parse(stored) as AuthState;

		// Validate the parsed data structure
		if (typeof parsed.isAuthenticated !== 'boolean' || typeof parsed.timestamp !== 'number') {
			console.warn('Invalid auth state structure in localStorage, clearing...');
			localStorage.removeItem(STORAGE_KEY);
			return defaultState;
		}

		// Check if auth is still valid (within 2 hours)
		if (parsed.timestamp && Date.now() - parsed.timestamp < 2 * 60 * 60 * 1000) {
			return parsed;
		}

		// Auth has expired, clear it
		localStorage.removeItem(STORAGE_KEY);
		return defaultState;
	} catch (error) {
		// Handle JSON parse errors or localStorage access errors
		if (error instanceof SyntaxError) {
			console.error('Failed to parse auth state from localStorage, clearing corrupted data:', error);
		} else if (error instanceof DOMException) {
			console.error('localStorage is not available or quota exceeded:', error);
		} else {
			console.error('Unexpected error loading auth state:', error);
		}

		// Try to clear the corrupted data
		try {
			localStorage.removeItem(STORAGE_KEY);
		} catch (clearError) {
			console.error('Failed to clear corrupted auth state:', clearError);
		}

		return defaultState;
	}
};

const initialState: AuthState = loadStoredState();

// Create writable store for auth state
export const authStore = writable<AuthState>(initialState);

// Subscribe to store changes and persist to localStorage
if (browser) {
	authStore.subscribe((state) => {
		try {
			// Only save if authenticated, otherwise remove
			if (state.isAuthenticated && state.timestamp) {
				localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
			} else {
				localStorage.removeItem(STORAGE_KEY);
			}
		} catch (error) {
			if (error instanceof DOMException && error.name === 'QuotaExceededError') {
				console.error('localStorage quota exceeded, unable to save auth state');
				// Clear auth state since we can't persist it
				authStore.set({ isAuthenticated: false, timestamp: null });
			} else if (error instanceof DOMException) {
				console.error('localStorage is not available:', error);
			} else {
				console.error('Failed to save auth state to localStorage:', error);
			}
		}
	});
}

//  C L I E N T - S I D E   H E L P E R S  ------------------------------------------- //

export function setAuthenticated(isAuth: boolean): void {
	// 1. Set authentication state and timestamp

	// ------------------------------------------------------------------- //

	// [ STEP 1. ] - Set authentication state and timestamp
	authStore.set({
		isAuthenticated: isAuth,
		timestamp: isAuth ? Date.now() : null
	});
}

export function clearAuthState(): void {
	// 1. Reset auth state to initial values
	// 2. Clear from localStorage with error handling

	// ------------------------------------------------------------------- //

	// [ STEP 1. ] - Reset auth state to initial values
	authStore.set({
		isAuthenticated: false,
		timestamp: null
	});

	// [ STEP 2. ] - Clear from localStorage with error handling
	if (browser) {
		try {
			localStorage.removeItem(STORAGE_KEY);
		} catch (error) {
			if (error instanceof DOMException) {
				console.error('Failed to clear auth state from localStorage (localStorage unavailable):', error);
			} else {
				console.error('Unexpected error clearing auth state:', error);
			}
			// Auth is already cleared in memory, so this is not critical
		}
	}
}

export function cleanAuthFromUrl(): void {
	// 1. Check browser environment
	// 2. Clean URL after auth code is consumed using SvelteKit navigation

	// ------------------------------------------------------------------- //

	// [ STEP 1. ] - Check browser environment
	if (!browser) return;

	// [ STEP 2. ] - Use SvelteKit's goto to clean URL
	const url = new URL(window.location.href);
	if (url.searchParams.has('auth')) {
		url.searchParams.delete('auth');
		const cleanPath = url.pathname + (url.search ? url.search : '');
		goto(cleanPath, { replaceState: true });
	}
}

export function redirectToHome(): void {
	// 1. Check browser environment
	// 2. Navigate to home page using SvelteKit navigation

	// ------------------------------------------------------------------- //

	// [ STEP 1. ] - Check browser environment
	if (!browser) return;

	// [ STEP 2. ] - Use SvelteKit's goto for navigation
	goto('/');
}

export function handlePageReload(): void {
	// 1. Check browser environment
	// 2. Set up beforeunload listener
	// 3. Clear auth state if no auth param

	// ------------------------------------------------------------------- //

	// [ STEP 1. ] - Check browser environment
	if (!browser) return;

	// [ STEP 2. ] - Set up beforeunload listener (disabled for development)
	// window.addEventListener('beforeunload', () => {
	//     clearAuthState();
	// });

	// [ STEP 3. ] - Only clear auth state on actual page reload (not after auth flow)
	// Note: Don't clear auth just because URL has no auth param - it gets removed after successful auth
}

export function completeAuthFlow(): void {
	// 1. Set authenticated state
	// 2. Clean URL from auth parameters
	// 3. Set auto-logout timer

	// ------------------------------------------------------------------- //

	// [ STEP 1. ] - Set authenticated state
	setAuthenticated(true);

	// [ STEP 2. ] - Clean URL from auth parameters
	cleanAuthFromUrl();

	// [ STEP 3. ] - Set auto-logout timer
	setTimeout(
		() => {
			clearAuthState();
		},
		2 * 60 * 60 * 1000
	); // 2 hours for development
}

if (browser) {
	handlePageReload();
}
