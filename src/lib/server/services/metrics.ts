import { db, totalEventCount } from '$lib/server';

// ============================================================================
// METRICS CONFIGURATION
// ============================================================================

export const METRICS_CONFIG = {
    // Define which metrics to track and their display names
    users: {
        displayName: 'Users',
        dbField: 'user_created_total' as const,
        enabled: true
    },
    downloads: {
        displayName: 'Downloads',
        dbField: 'download_started_total' as const,
        enabled: true
    },
    subscriptions: {
        displayName: 'Subscriptions',
        dbField: 'subscription_activated_total' as const,
        enabled: true
    }
    // Add new metrics here:
    // revenue: {
    //     displayName: 'Revenue',
    //     dbField: 'revenue_total' as const,
    //     enabled: false
    // }
} as const;

// ============================================================================
// TYPES
// ============================================================================

export interface MetricItem {
    name: string;
    value: number;
}

type MetricConfigKey = keyof typeof METRICS_CONFIG;
type MetricDbFields = typeof METRICS_CONFIG[MetricConfigKey]['dbField'];

// ============================================================================
// METRICS SERVICE
// ============================================================================

/**
 * Fetches raw metrics data from the database
 */
export async function fetchRawMetrics(database = db) {
    try {
        const rawMetrics = await database.select().from(totalEventCount).limit(1);
        return rawMetrics[0] || createEmptyMetricsData();
    } catch (error) {
        console.error('Failed to fetch raw metrics:', error);
        return createEmptyMetricsData();
    }
}

/**
 * Transforms raw database metrics into the format expected by MetricsBlock
 */
export function transformMetricsForDisplay(rawMetrics: Record<string, any>): MetricItem[] {
    return Object.entries(METRICS_CONFIG)
        .filter(([_, config]) => config.enabled)
        .map(([key, config]) => ({
            name: config.displayName,
            value: Number(rawMetrics[config.dbField]) || 0
        }));
}

/**
 * Main function to get formatted metrics for the frontend
 */
export async function getMetrics(database = db): Promise<MetricItem[]> {
    const rawMetrics = await fetchRawMetrics(database);
    return transformMetricsForDisplay(rawMetrics);
}

/**
 * Creates empty metrics data structure for fallback
 */
function createEmptyMetricsData(): Record<MetricDbFields, number> {
    return {
        user_created_total: 0,
        download_started_total: 0,
        subscription_activated_total: 0
    };
}

/**
 * Get metrics configuration for debugging/admin purposes
 */
export function getMetricsConfig() {
    return {
        enabled: Object.entries(METRICS_CONFIG)
            .filter(([_, config]) => config.enabled)
            .map(([key, config]) => ({ key, ...config })),
        disabled: Object.entries(METRICS_CONFIG)
            .filter(([_, config]) => !config.enabled)
            .map(([key, config]) => ({ key, ...config }))
    };
}