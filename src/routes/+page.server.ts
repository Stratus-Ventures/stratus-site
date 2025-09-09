import { db, stratusProducts } from '$lib/server';

// 1. Load products from database
// 2. Return data for the page

// ----------------------------------------------------------- //

// [ STEP 1. ]
export async function load() {
    try {
        const products = await db.select().from(stratusProducts);
        return {
            products
        };
    } catch (error) {
        console.error('Error loading products:', error);
        return {
            products: []
        };
    }
}
