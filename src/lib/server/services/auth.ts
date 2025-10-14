//  A U T H   S E R V I C E  --------------------------------------------------------- //

import { sendAuthCodeEmail } from './email';
import { logger } from './logger';

let currentValidCode: string | null = null;

//  C O D E   G E N E R A T I O N  --------------------------------------------------- //

export function generateAuthCode(): string {
	// 1. Create character set for code generation
	// 2. Build 6-character random code

	// ------------------------------------------------------------------- //

	// [ STEP 1. ] - Create character set for code generation
	const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

	// [ STEP 2. ] - Build 6-character random code
	let code = '';
	for (let i = 0; i < 6; i++) {
		code += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return code;
}

//  C O D E   V A L I D A T I O N  --------------------------------------------------- //

export function validateAuthCode(code: string): boolean {
	// 1. Check if codes exist and are valid
	// 2. Compare codes case-insensitively

	// ------------------------------------------------------------------- //

	// [ STEP 1. ] - Check if codes exist and are valid
	if (!currentValidCode || !code) {
		return false;
	}

	// [ STEP 2. ] - Compare codes case-insensitively
	return code.toUpperCase() === currentValidCode.toUpperCase();
}

export function extractAuthCodeFromUrl(url: URL): string | null {
	// 1. Extract auth parameter from URL search params

	// ------------------------------------------------------------------- //

	// [ STEP 1. ] - Extract auth parameter from URL search params
	return url.searchParams.get('auth');
}

//  C O D E   R O T A T I O N  ------------------------------------------------------- //

export async function rotateAuthCode(baseUrl?: string): Promise<string> {
	// 1. Generate new authentication code
	// 2. Set as current valid code
	// 3. Send email with code and URL if baseUrl provided

	// ------------------------------------------------------------------- //

	// [ STEP 1. ] - Generate new authentication code
	const newCode = generateAuthCode();

	// [ STEP 2. ] - Set as current valid code
	currentValidCode = newCode;

	// [ STEP 3. ] - Send email with code and URL if baseUrl provided
	if (baseUrl) {
		const testUrl = `${baseUrl}/?auth=${newCode}`;
		try {
			await sendAuthCodeEmail(newCode, testUrl);
		} catch (error) {
			logger.error('Failed to send auth code email', error);
		}
	} else {
		logger.info('New auth code generated', { code: newCode });
	}

	return newCode;
}

export async function consumeAndRotateCode(baseUrl?: string): Promise<string> {
	// 1. Log current code consumption
	// 2. Invalidate current code
	// 3. Generate and return new code

	// ------------------------------------------------------------------- //

	// [ STEP 1. ] - Log current code consumption
	logger.info('Auth code consumed', { code: currentValidCode });

	// [ STEP 2. ] - Invalidate current code
	currentValidCode = null;

	// [ STEP 3. ] - Generate and return new code
	return await rotateAuthCode(baseUrl);
}

//  S T A T E   M A N A G E M E N T  ------------------------------------------------- //

export function getCurrentValidCode(): string | null {
	// 1. Return current valid code for debugging

	// ------------------------------------------------------------------- //

	// [ STEP 1. ] - Return current valid code for debugging
	return currentValidCode;
}

export async function initializeAuth(baseUrl?: string): Promise<string> {
	// 1. Check if valid code exists
	// 2. Generate new code only if none exists (no email sending)
	// 3. Return current or new code

	// ------------------------------------------------------------------- //

	// [ STEP 1. ] - Check if valid code exists
	if (!currentValidCode) {
		// [ STEP 2. ] - Generate new code only if none exists (no email sending)
		const newCode = generateAuthCode();
		currentValidCode = newCode;
		logger.info('Auth code initialized without email', { code: newCode });
		return newCode;
	}

	// [ STEP 3. ] - Return current or new code
	return currentValidCode;
}

export async function requestAuthCode(baseUrl: string): Promise<string> {
	// 1. Initialize auth if no code exists
	// 2. Send email with current code
	// 3. Return code

	// ------------------------------------------------------------------- //

	logger.info('🔑 requestAuthCode called with baseUrl:', baseUrl);

	// [ STEP 1. ] - Initialize auth if no code exists
	const code = await initializeAuth();
	logger.info('Code initialized:', code);

	// [ STEP 2. ] - Send email with current code
	const testUrl = `${baseUrl}/?auth=${code}`;
	logger.info('Constructed test URL:', testUrl);

	try {
		logger.info('Calling sendAuthCodeEmail...');
		await sendAuthCodeEmail(code, testUrl);
		logger.success('✅ Auth code email sent on request', { code });
	} catch (error) {
		logger.error('❌ Failed to send requested auth code email', error);
		throw error;
	}

	// [ STEP 3. ] - Return code
	return code;
}

//  U R L   H E L P E R S  ----------------------------------------------------------- //

export function cleanAuthFromUrl(): void {
	// 1. Check if running in browser environment
	// 2. Create URL object from current location
	// 3. Remove auth parameter and update history

	// ------------------------------------------------------------------- //

	// [ STEP 1. ] - Check if running in browser environment
	if (typeof window !== 'undefined') {
		// [ STEP 2. ] - Create URL object from current location
		const url = new URL(window.location.href);
		url.searchParams.delete('auth');

		// [ STEP 3. ] - Remove auth parameter and update history
		window.history.replaceState({}, '', url.pathname + url.search);
	}
}

export function redirectToHome(): void {
	// 1. Check if running in browser environment
	// 2. Redirect to home page

	// ------------------------------------------------------------------- //

	// [ STEP 1. ] - Check if running in browser environment
	if (typeof window !== 'undefined') {
		// [ STEP 2. ] - Redirect to home page
		window.history.replaceState({}, '', '/');
	}
}

//  A U T H   F L O W   H E L P E R  ------------------------------------------------- //

export async function processAuthFromUrl(url: URL): Promise<{
	isAuthenticated: boolean;
	newCode?: string;
	error?: string;
}> {
	// 1. Extract auth code from URL
	// 2. Validate extracted code
	// 3. Handle successful authentication
	// 4. Return authentication result

	// ------------------------------------------------------------------- //

	// [ STEP 1. ] - Extract auth code from URL
	const codeFromUrl = extractAuthCodeFromUrl(url);

	if (!codeFromUrl) {
		return { isAuthenticated: false, error: 'No auth code provided' };
	}

	// [ STEP 2. ] - Validate extracted code
	if (validateAuthCode(codeFromUrl)) {
		// [ STEP 3. ] - Handle successful authentication
		const newCode = await consumeAndRotateCode(url.origin);
		return {
			isAuthenticated: true,
			newCode
		};
	}

	// [ STEP 4. ] - Return authentication result
	return {
		isAuthenticated: false,
		error: 'Invalid auth code'
	};
}

// Don't auto-initialize - only generate codes when needed
