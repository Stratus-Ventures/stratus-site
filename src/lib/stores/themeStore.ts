import { writable } from 'svelte/store';
import { browser } from '$app/environment';

type Theme = 'light' | 'dark';

// Initialize theme from localStorage or system preference
function getInitialTheme(): Theme {
	if (!browser) return 'light';
	
	const stored = localStorage.getItem('theme') as Theme;
	if (stored === 'light' || stored === 'dark') {
		return stored;
	}
	
	// Check system preference
	const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
	return prefersDark ? 'dark' : 'light';
}

// Create the theme store
export const theme = writable<Theme>(getInitialTheme());

// Subscribe to theme changes and update DOM + localStorage
theme.subscribe((value) => {
	if (!browser) return;
	
	// Update DOM class
	document.documentElement.classList.remove('light', 'dark');
	document.documentElement.classList.add(value);
	
	// Persist to localStorage
	localStorage.setItem('theme', value);
});

// Toggle function
export function toggleTheme() {
	theme.update(current => current === 'light' ? 'dark' : 'light');
}

// Listen to system theme changes when in system mode
if (browser) {
	const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
	mediaQuery.addEventListener('change', (e) => {
		// Only auto-update if no explicit theme is stored
		if (!localStorage.getItem('theme')) {
			theme.set(e.matches ? 'dark' : 'light');
		}
	});
}
