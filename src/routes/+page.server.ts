import { db, totalEventCount, getFormattedProducts, processAuthFromUrl, logger, stratusProducts } from '$lib/server';
import { eq } from 'drizzle-orm';
import type { PageServerLoad, Actions } from './$types';
import type { Product } from '$lib/types';
import { fail } from '@sveltejs/kit';


//  L O A D   F U N C T I O N  ------------------------------------------------------- //

export const load: PageServerLoad = async ({ url }) => {
    
    // 1. Fetch formatted products from database
    // 2. Process authentication from URL parameters
    // 3. Return data with error handling

    // ------------------------------------------------------------------- //

    try {

        // [ STEP 1. ] - Fetch formatted products from database
        const products: Product[] = await getFormattedProducts(db);

        // [ STEP 1.5. ] - Fetch metrics from database
        const rawMetrics = await db.select().from(totalEventCount).limit(1);
        const metricsData = rawMetrics[0] || {
            user_created_total: 0,
            download_started_total: 0,
            subscription_activated_total: 0
        };

        // Transform metrics into the format expected by MetricsBlock
        const metrics = [
            { name: "Users", value: Number(metricsData.user_created_total) || 0 },
            { name: "Downloads", value: Number(metricsData.download_started_total) || 0 },
            { name: "Subscriptions", value: Number(metricsData.subscription_activated_total) || 0 }
        ];

        // [ STEP 2. ] - Process authentication from URL parameters
        const authResult = processAuthFromUrl(url);

        // [ STEP 2.5. ] - Debug: Log first product to verify ID field
        if (products.length > 0) {
            console.log('📦 First product structure:', {
                id: products[0].id,
                name: products[0].name,
                hasId: !!products[0].id
            });
        }

        // [ STEP 3. ] - Log current auth code for testing
        const { getCurrentValidCode } = await import('$lib/server/services/auth');
        const currentCode = getCurrentValidCode();
        console.log(`🔐 [Page Reload] Current auth code: ${currentCode}`);
        console.log(`🔗 Test URL: ${url.origin}/?auth=${currentCode}`);

        // [ STEP 4. ] - Return data with error handling
        return {
            products,
            metrics,
            error: null,
            auth: authResult
        };


    } catch (error) {
        logger.error('Failed to load products', error);
        
        return {
            products: [],
            metrics: [
                { name: "Users", value: 0 },
                { name: "Downloads", value: 0 },
                { name: "Subscriptions", value: 0 }
            ],
            error: 'An Error Occured'
        };
    }
};

//  A C T I O N S  --------------------------------------------------------------- //

export const actions: Actions = {
    async createProduct({ request }) {
        const formData = await request.formData();
        const name = formData.get('name') as string;
        const tagline = formData.get('tagline') as string;
        const url = formData.get('url') as string;

        if (!name || !tagline) {
            return fail(400, { error: 'Product name and tagline are required' });
        }

        try {
            const result = await db.insert(stratusProducts).values({
                source_id: `product_${Date.now()}`,
                name,
                tagline,
                url
            }).returning();
            
            return { success: true };
        } catch (error) {
            logger.error('Failed to create product', error);
            return fail(500, { error: 'Failed to create product' });
        }
    },

    async updateProduct({ request }) {
        const formData = await request.formData();
        const id = formData.get('id') as string;
        const name = formData.get('name') as string;
        const tagline = formData.get('tagline') as string;
        const url = formData.get('url') as string;

        if (!id || !name || !tagline) {
            return fail(400, { error: 'Product name and tagline are required' });
        }

        try {
            await db.update(stratusProducts)
                .set({ name, tagline, url })
                .where(eq(stratusProducts.id, id));
                
            return { success: true };
        } catch (error) {
            logger.error('Failed to update product', error);
            return fail(500, { error: 'Failed to update product' });
        }
    },

    async deleteProduct({ request }) {
        const formData = await request.formData();
        const id = formData.get('id') as string;

        if (!id) {
            return fail(400, { error: 'Product ID is required' });
        }

        try {
            await db.delete(stratusProducts).where(eq(stratusProducts.id, id));
            return { success: true };
        } catch (error) {
            logger.error('Failed to delete product', error);
            return fail(500, { error: 'Failed to delete product' });
        }
    }
};
