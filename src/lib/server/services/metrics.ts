import { db, totalEventCount, stratusMetrics, stratusProducts, logger } from '$lib/server';
import { eq, and } from 'drizzle-orm';
import type { StratusProduct } from '$lib/types';

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

export interface ExternalMetric {
    id?: string;
    event_type: 'user_created' | 'download_started' | 'subscription_activated';
    origin_lat: number;
    origin_long: number;
    city_code: string;
    country_code: string;
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

// ============================================================================
// EXTERNAL METRICS SYNCING
// ============================================================================

/**
 * Fetches metrics from a product's /api/stratus-metrics endpoint
 */
export async function fetchProductMetrics(productUrl: string): Promise<ExternalMetric[]> {
    try {
        // Ensure URL ends with /api/stratus-metrics
        const metricsUrl = productUrl.endsWith('/')
            ? `${productUrl}api/stratus-metrics`
            : `${productUrl}/api/stratus-metrics`;

        console.log(`🔍 Fetching metrics from: ${metricsUrl}`);

        const response = await fetch(metricsUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Stratus-Central-Control',
                'Origin': 'https://stratus-ventures.org',
                'Referer': 'https://stratus-ventures.org/'
            },
            // Add timeout to prevent hanging
            signal: AbortSignal.timeout(10000) // 10 second timeout
        });

        if (!response.ok) {
            // If 404, the endpoint doesn't exist yet - this is expected
            if (response.status === 404) {
                console.log(`⚠️  Metrics endpoint not found for ${productUrl} (404) - skipping`);
                return [];
            }

            // For 500 errors, try to get more details from response body
            if (response.status === 500) {
                try {
                    const errorText = await response.text();
                    console.error(`❌ Server error (500) from ${productUrl}: ${errorText.substring(0, 200)}`);
                } catch {
                    console.error(`❌ Server error (500) from ${productUrl}: Unable to read error details`);
                }
            }

            throw new Error(`Failed to fetch metrics: ${response.status} ${response.statusText}`);
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            console.log(`⚠️  Non-JSON response from ${productUrl} - skipping`);
            return [];
        }

        const metrics = await response.json();

        // Validate that we received an array
        if (!Array.isArray(metrics)) {
            console.log(`⚠️  Invalid metrics format from ${productUrl} (expected array) - skipping`);
            return [];
        }

        console.log(`✅ Successfully fetched ${metrics.length} metrics from ${productUrl}`);
        return metrics;
    } catch (error) {
        // Log different types of errors with appropriate severity
        if (error instanceof Error) {
            if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
                console.log(`⚠️  Domain not found: ${productUrl} - skipping`);
            } else if (error.message.includes('CERT_HAS_EXPIRED')) {
                console.log(`⚠️  SSL certificate expired: ${productUrl} - skipping`);
            } else if (error.message.includes('timeout')) {
                console.log(`⚠️  Request timeout: ${productUrl} - skipping`);
            } else {
                console.error(`❌ Error fetching metrics from ${productUrl}:`, error.message);
            }
        } else {
            console.error(`❌ Unknown error fetching metrics from ${productUrl}:`, error);
        }

        // Return empty array instead of throwing - allows other products to continue
        return [];
    }
}

/**
 * Stores external metrics in the local database, avoiding duplicates
 */
export async function storeProductMetrics(
    productId: string,
    sourceId: string,
    externalMetrics: ExternalMetric[],
    database = db
): Promise<void> {
    try {
        // Clear existing metrics for this product to avoid duplicates
        await database.delete(stratusMetrics)
            .where(eq(stratusMetrics.product_name, sourceId));

        // Batch insert all metrics at once
        const metricsToInsert = externalMetrics.map(metric => ({
            id: metric.id,
            event_type: metric.event_type,
            origin_lat: metric.origin_lat,
            origin_long: metric.origin_long,
            city_code: metric.city_code,
            country_code: metric.country_code,
            product_name: sourceId
        }));

        if (metricsToInsert.length > 0) {
            await database.insert(stratusMetrics).values(metricsToInsert);
        }

        const storedCount = metricsToInsert.length;

        logger.info(`Successfully stored ${storedCount} metrics for product ${sourceId} (replaced existing)`);
    } catch (error) {
        logger.error(`Error storing metrics for product ${sourceId}:`, error);
        throw error;
    }
}

/**
 * Syncs metrics for a single product
 */
export async function syncProductMetrics(product: StratusProduct, database = db): Promise<{
    success: boolean;
    metricsCount?: number;
    error?: string;
}> {
    try {
        if (!product.url) {
            return {
                success: false,
                error: 'Product URL is required'
            };
        }

        const externalMetrics = await fetchProductMetrics(product.url);

        // Only store metrics if we actually got some
        if (externalMetrics.length > 0) {
            await storeProductMetrics(product.id, product.source_id, externalMetrics, database);
        }

        return {
            success: true,
            metricsCount: externalMetrics.length
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return {
            success: false,
            error: errorMessage
        };
    }
}

/**
 * Syncs metrics for all products
 */
export async function syncAllProductMetrics(database = db): Promise<{
    totalProducts: number;
    successfulSyncs: number;
    failedSyncs: number;
    results: Array<{
        productName: string;
        success: boolean;
        metricsCount?: number;
        error?: string;
    }>;
}> {
    try {
        // Get all products
        const products = await database.select().from(stratusProducts);

        // Sync all products in parallel, ensuring proper typing for 'product'
        const syncPromises = products.map(async (product: StratusProduct) => {
            const result = await syncProductMetrics(product, database);
            return {
                productName: product.name,
                success: result.success,
                metricsCount: result.metricsCount,
                error: result.error
            };
        });

        const results = await Promise.allSettled(syncPromises);
        let successfulSyncs = 0;
        let failedSyncs = 0;

        const finalResults = results.map((result) => {
            if (result.status === 'fulfilled') {
                if (result.value.success) {
                    successfulSyncs++;
                } else {
                    failedSyncs++;
                }
                return result.value;
            } else {
                failedSyncs++;
                return {
                    productName: 'Unknown',
                    success: false,
                    error: result.reason?.message || 'Unknown error'
                };
            }
        });

        return {
            totalProducts: products.length,
            successfulSyncs,
            failedSyncs,
            results: finalResults
        };
    } catch (error) {
        console.error('Error syncing all product metrics:', error);
        throw error;
    }
}