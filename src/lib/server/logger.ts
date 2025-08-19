// Universal Server Logger
// Simple, human-readable logging for both Stratus and Clovis APIs
import { dev } from '$app/environment';

export const logger = {
	// Basic logging levels
	info: (message: string, data?: any) => {
		if (dev) {
			console.info(`ℹ️  ${message}`, data || '');
		}
	},
	
	warn: (message: string, data?: any) => {
		console.warn(`⚠️  ${message}`, data || '');
	},
	
	error: (message: string, error?: any) => {
		console.error(`❌ ${message}`, error || '');
	},
	
	debug: (message: string, data?: any) => {
		if (dev) {
			console.debug(`🔍 ${message}`, data || '');
		}
	},

	// API-specific helpers (human readable)
	apiCall: (endpoint: string, origin: string | null) => {
		if (dev) {
			console.info(`🌐 API Call: ${endpoint} from ${origin || 'unknown'}`);
		}
	},

	apiSuccess: (endpoint: string, details?: string) => {
		if (dev) {
			console.info(`✅ API Success: ${endpoint}${details ? ` - ${details}` : ''}`);
		}
	},

	apiBlocked: (endpoint: string, reason: string, origin?: string) => {
		if (dev) {
			console.warn(`🚫 API Blocked: ${endpoint} - ${reason} (from ${origin || 'unknown'})`);
		}
	},

	database: (operation: string, result?: any) => {
		if (dev) {
			console.info(`💾 Database: ${operation}${result ? ` - ${result}` : ''}`);
		}
	},

	sync: (message: string, data?: any) => {
		console.info(`🔄 Sync: ${message}`, data || '');
	}
};