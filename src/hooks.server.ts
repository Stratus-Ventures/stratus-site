import { startPoller, stopPoller } from '$lib/server/poller';
import { logger } from '$lib/server/logger';

/**
 * Server initialization hook - runs once when the server starts
 * Used for initializing database clients, background services, etc.
 */
export async function init() {
	try {
		logger.info('Server initializing - starting realtime poller service');
		
		// Start aggressive polling every 10 seconds for changes
		startPoller(10);
		
		logger.info('Realtime poller service started successfully');
		
		// Graceful shutdown handling
		process.on('SIGTERM', () => {
			logger.info('SIGTERM received - stopping poller service');
			stopPoller();
		});
		
		process.on('SIGINT', () => {
			logger.info('SIGINT received - stopping poller service');
			stopPoller();
		});
		
	} catch (err: unknown) {
		if (err instanceof Error) {
			logger.error('Failed to initialize server services', err);
			throw err; // Re-throw to prevent server startup if critical services fail
		} else {
			const error = new Error(`Server initialization failed: ${String(err)}`);
			logger.error('Failed to initialize server services', error);
			throw error;
		}
	}
}

/**
 * Error handling hook - catches unexpected errors during loading or rendering
 */
export function handleError({ error, event }) {
	logger.error('Unhandled server error', {
		error: error instanceof Error ? error.message : String(error),
		stack: error instanceof Error ? error.stack : undefined,
		url: event.url.pathname,
		method: event.request.method
	});

	// SvelteKit expects either Error object or void, not custom objects
	return new Error('An internal error occurred');
}