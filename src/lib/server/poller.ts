import { syncAllProducts } from './stratus-internal/sync';
import { getAllProductConfigs } from './stratus-internal/config';
import { getApiHeaders } from './stratus-internal/config';
import { logger } from './logger';

interface PollerState {
	isRunning: boolean;
	lastSyncCounts: Map<string, number>;
	intervalId: NodeJS.Timeout | null;
}

const pollerState: PollerState = {
	isRunning: false,
	lastSyncCounts: new Map(),
	intervalId: null
};

export async function checkForChanges(): Promise<boolean> {
	try {
		const configs = getAllProductConfigs();
		
		// Security: Validate configs exist
		if (!configs.length) {
			logger.warn('Poller: No product configurations found');
			return false;
		}

		let hasChanges = false;

		for (const config of configs) {
			try {
				// Security: Validate config has required fields
				if (!config.apiUrl || !config.apiKey || !config.name) {
					logger.warn(`Poller: Invalid config for product`, { productName: config.name });
					continue;
				}

				const response = await fetch(`${config.apiUrl}/product-events`, {
					headers: getApiHeaders(config.apiKey),
					signal: AbortSignal.timeout(5000)
				});

				// Enhanced error handling
				if (!response.ok) {
					if (response.status === 401) {
						logger.error(`Poller: Authentication failed for ${config.name}`, { status: response.status });
					} else if (response.status === 403) {
						logger.error(`Poller: Access forbidden for ${config.name}`, { status: response.status });
					} else if (response.status >= 500) {
						logger.error(`Poller: Server error for ${config.name}`, { status: response.status });
					} else {
						logger.debug(`Poller: ${config.name} API unavailable`, { status: response.status });
					}
					continue;
				}

				const data = await response.json();
				
				// Security: Validate response structure
				if (!data || typeof data !== 'object') {
					logger.warn(`Poller: Invalid response format from ${config.name}`);
					continue;
				}

				const currentCount = Array.isArray(data.stratusProductEvents) ? data.stratusProductEvents.length : 0;
				const lastCount = pollerState.lastSyncCounts.get(config.name) || 0;

				if (currentCount !== lastCount) {
					const changeType = currentCount > lastCount ? 'increase' : 'decrease';
					const changeAmount = Math.abs(currentCount - lastCount);
					
					logger.info(`🔄 Data change detected for ${config.name}: ${lastCount} → ${currentCount} (${changeType} of ${changeAmount})`);
					pollerState.lastSyncCounts.set(config.name, currentCount);
					hasChanges = true;
				}

			} catch (err: unknown) {
				if (err instanceof TypeError && err.message.includes('fetch')) {
					logger.error(`Poller: Network error for ${config.name}`, err);
				} else if (err instanceof Error && err.name === 'AbortError') {
					logger.warn(`Poller: Request timeout for ${config.name}`);
				} else if (err instanceof Error) {
					logger.error(`Poller: Unexpected error for ${config.name}`, err);
				} else {
					logger.error(`Poller: Unknown error for ${config.name}`, { error: String(err) });
				}
			}
		}

		return hasChanges;

	} catch (err: unknown) {
		if (err instanceof Error) {
			logger.error('Poller: Critical error in checkForChanges', err);
		} else {
			logger.error('Poller: Critical unknown error in checkForChanges', { error: String(err) });
		}
		return false;
	}
}

async function pollAndSync() {
	if (!pollerState.isRunning) return;

	try {
		const hasChanges = await checkForChanges();
		
		if (hasChanges) {
			logger.info('🚀 Triggering realtime sync...');
			
			// Add timeout for sync operation
			const syncPromise = syncAllProducts();
			const timeoutPromise = new Promise((_, reject) => 
				setTimeout(() => reject(new Error('Sync timeout')), 30000)
			);
			
			await Promise.race([syncPromise, timeoutPromise]);
			logger.info('✅ Realtime sync completed successfully');
		}

	} catch (err: unknown) {
		if (err instanceof Error && err.message === 'Sync timeout') {
			logger.error('Poller: Sync operation timed out after 30 seconds');
		} else if (err instanceof Error) {
			logger.error('Poller: Error during poll and sync', err);
		} else {
			logger.error('Poller: Unknown error during poll and sync', { error: String(err) });
		}
		
		// Don't stop polling on sync errors - continue monitoring
	}
}

export function startPoller(intervalSeconds: number = 10): void {
	// Security: Validate interval
	if (intervalSeconds < 1 || intervalSeconds > 3600) {
		logger.error('Poller: Invalid interval - must be between 1 and 3600 seconds', { intervalSeconds });
		throw new Error('Invalid polling interval');
	}

	if (pollerState.isRunning) {
		logger.warn('Poller: Already running, stopping current instance');
		stopPoller();
	}

	logger.info(`Poller: Starting with ${intervalSeconds}s interval`);
	pollerState.isRunning = true;
	
	pollerState.intervalId = setInterval(() => {
		pollAndSync().catch((err: unknown) => {
			if (err instanceof Error) {
				logger.error('Poller: Unhandled error in polling cycle', err);
			} else {
				logger.error('Poller: Unhandled unknown error in polling cycle', { error: String(err) });
			}
		});
	}, intervalSeconds * 1000);

	// Initial poll with error handling
	pollAndSync().catch((err: unknown) => {
		if (err instanceof Error) {
			logger.error('Poller: Error during initial poll', err);
		} else {
			logger.error('Poller: Unknown error during initial poll', { error: String(err) });
		}
	});
}

export function stopPoller(): void {
	if (pollerState.intervalId) {
		clearInterval(pollerState.intervalId);
		pollerState.intervalId = null;
	}
	
	pollerState.isRunning = false;
	logger.info('Poller: Stopped');
}

export function getPollerStatus() {
	return {
		isRunning: pollerState.isRunning,
		lastSyncCounts: Object.fromEntries(pollerState.lastSyncCounts),
		intervalId: pollerState.intervalId !== null
	};
}