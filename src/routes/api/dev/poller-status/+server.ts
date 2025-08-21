import { json, error } from '@sveltejs/kit';
import { getPollerStatus } from '$lib/server/poller';
import { logger } from '$lib/server/logger';
import { env } from '$env/dynamic/private';

export async function GET({ request }) {
	try {
		// Security: Basic protection for dev endpoints
		if (env.NODE_ENV === 'production') {
			const authHeader = request.headers.get('authorization');
			if (!authHeader || !authHeader.startsWith('Bearer ')) {
				logger.warn('Unauthorized access to poller status in production');
				error(401, { message: 'Unauthorized' });
			}
		}

		const status = getPollerStatus();
		
		const response = {
			status: 'success',
			poller: {
				isRunning: status.isRunning,
				hasInterval: status.intervalId,
				lastSyncCounts: status.lastSyncCounts,
				timestamp: new Date().toISOString(),
				environment: env.NODE_ENV
			}
		};
		
		logger.apiSuccess('/api/dev/poller-status', 'Status retrieved');
		return json(response);
		
	} catch (err: unknown) {
		// Re-throw SvelteKit errors
		if (err && typeof err === 'object' && 'status' in err && err.status === 401) {
			throw err;
		}
		
		if (err instanceof Error) {
			logger.error('Error getting poller status', err);
			return json({ 
				status: 'error', 
				message: `Failed to get poller status: ${err.message}` 
			}, { status: 500 });
		} else {
			logger.error('Unknown error getting poller status', { error: String(err) });
			return json({ 
				status: 'error', 
				message: 'Failed to get poller status: Unknown error' 
			}, { status: 500 });
		}
	}
}