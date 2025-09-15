import { getFormattedProducts, processAuthFromUrl, logger, db } from '$lib/server';
import { getMetrics, syncAllProductMetrics } from '$lib/server/services/metrics';
import { createProduct, updateProduct, deleteProduct, validateProductData } from '$lib/server/services/products';
import type { PageServerLoad, Actions } from './$types';
import type { Product } from '$lib/types';
import { fail } from '@sveltejs/kit';


//  L O A D   F U N C T I O N  ------------------------------------------------------- //

export const load: PageServerLoad = async ({ url }) => {
    try {
        // ================================================================
        // PRODUCTS DATA
        // ================================================================
        const products: Product[] = await getFormattedProducts(db);

        // ================================================================
        // METRICS SYNC & DATA
        // ================================================================
        // First sync metrics from all products
        try {
            logger.info('Auto-syncing metrics on page load');
            await syncAllProductMetrics();
        } catch (error) {
            logger.error('Failed to auto-sync metrics on page load', error);
            // Continue loading page even if sync fails
        }

        // Then get the updated metrics for display
        const metrics = await getMetrics();

        // ================================================================
        // AUTHENTICATION
        // ================================================================
        const authResult = processAuthFromUrl(url);

        // ================================================================
        // DEBUG LOGGING
        // ================================================================
        // Log first product structure for debugging
        if (products.length > 0) {
            console.log('📦 First product structure:', {
                id: products[0].id,
                name: products[0].name,
                hasId: !!products[0].id
            });
        }

        // Log current auth code for testing
        const { getCurrentValidCode } = await import('$lib/server/services/auth');
        const currentCode = getCurrentValidCode();
        console.log(`🔐 [Page Reload] Current auth code: ${currentCode}`);
        console.log(`🔗 Test URL: ${url.origin}/?auth=${currentCode}`);

        // ================================================================
        // RETURN DATA
        // ================================================================
        return {
            products,
            metrics,
            error: null,
            auth: authResult
        };

    } catch (error) {
        logger.error('Failed to load page data', error);

        return {
            products: [],
            metrics: [],
            error: 'An Error Occurred'
        };
    }
};

//  A C T I O N S  --------------------------------------------------------------- //

export const actions: Actions = {
    // ====================================================================
    // CREATE PRODUCT
    // ====================================================================
    async createProduct({ request }) {
        const formData = await request.formData();
        const validation = validateProductData(formData);

        if (!validation.isValid) {
            return fail(400, { error: validation.error });
        }

        try {
            await createProduct(validation.data!);
            return { success: true };
        } catch (error) {
            logger.error('Failed to create product', error);
            return fail(500, { error: 'Failed to create product' });
        }
    },

    // ====================================================================
    // UPDATE PRODUCT
    // ====================================================================
    async updateProduct({ request }) {
        const formData = await request.formData();
        const validation = validateProductData(formData);

        if (!validation.isValid) {
            return fail(400, { error: validation.error });
        }

        if (!('id' in validation.data!)) {
            return fail(400, { error: 'Product ID is required for updates' });
        }

        try {
            await updateProduct(validation.data as any);
            return { success: true };
        } catch (error) {
            logger.error('Failed to update product', error);
            return fail(500, { error: 'Failed to update product' });
        }
    },

    // ====================================================================
    // DELETE PRODUCT
    // ====================================================================
    async deleteProduct({ request }) {
        const formData = await request.formData();
        const id = formData.get('id') as string;

        if (!id) {
            return fail(400, { error: 'Product ID is required' });
        }

        try {
            await deleteProduct(id);
            return { success: true };
        } catch (error) {
            logger.error('Failed to delete product', error);
            return fail(500, { error: 'Failed to delete product' });
        }
    },

    // ====================================================================
    // SYNC METRICS
    // ====================================================================
    async syncMetrics() {
        try {
            logger.info('Starting metrics sync for all products');
            const result = await syncAllProductMetrics();

            logger.info('Metrics sync completed', {
                totalProducts: result.totalProducts,
                successful: result.successfulSyncs,
                failed: result.failedSyncs
            });

            return {
                success: true,
                result: {
                    totalProducts: result.totalProducts,
                    successfulSyncs: result.successfulSyncs,
                    failedSyncs: result.failedSyncs,
                    results: result.results
                }
            };
        } catch (error) {
            logger.error('Failed to sync metrics', error);
            return fail(500, { error: 'Failed to sync metrics' });
        }
    }
};
