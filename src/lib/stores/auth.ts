import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { goto } from '$app/navigation';

//  A U T H   S T O R E  ------------------------------------------------------------- //

interface AuthState {
    isAuthenticated: boolean;
    timestamp: number | null;
}

const initialState: AuthState = {
    isAuthenticated: false,
    timestamp: null
};

// Create writable store for auth state
export const authStore = writable<AuthState>(initialState);

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
are 
export function clearAuthState(): void {

    // 1. Reset auth state to initial values

    // ------------------------------------------------------------------- //

    // [ STEP 1. ] - Reset auth state to initial values
    authStore.set(initialState);
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
    setTimeout(() => {
        clearAuthState();
    }, 2 * 60 * 60 * 1000); // 2 hours for development
}

if (browser) {
    handlePageReload();
}
