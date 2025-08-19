// Server-side logging utility
import { dev } from '$app/environment';

export const logger = {
	info: (message: string, ...args: any[]) => {
		if (dev) {
			console.info(`[STRATUS-API] ${message}`, ...args);
		}
	},
	
	warn: (message: string, ...args: any[]) => {
		console.warn(`[STRATUS-API] ${message}`, ...args);
	},
	
	error: (message: string, ...args: any[]) => {
		console.error(`[STRATUS-API] ${message}`, ...args);
	},
	
	debug: (message: string, ...args: any[]) => {
		if (dev) {
			console.debug(`[STRATUS-API] ${message}`, ...args);
		}
	}
};