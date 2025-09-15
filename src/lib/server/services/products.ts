import { db, stratusProducts } from '$lib/server';
import { eq, like } from 'drizzle-orm';
import { syncProductMetrics } from './metrics';
import { logger } from '$lib/server';

// ============================================================================
// PRODUCT ACTION SERVICES
// ============================================================================

export interface CreateProductData {
    name: string;
    tagline: string;
    url: string;
}

export interface UpdateProductData {
    id: string;
    name: string;
    tagline: string;
    url: string;
}

/**
 * Generates a unique source_id with numbering to avoid duplicates
 */
async function generateUniqueSourceId(baseSourceId: string, database = db): Promise<string> {
    // Single query to get all source_ids that start with our base pattern (including base itself)
    const pattern = `${baseSourceId}%`;
    const existing = await database.select({ source_id: stratusProducts.source_id })
        .from(stratusProducts)
        .where(like(stratusProducts.source_id, pattern));

    // If no matches, start with -0
    if (existing.length === 0) {
        return `${baseSourceId}-0`;
    }

    // Extract numbers from matching source_ids
    const escapedBase = baseSourceId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const numbers = existing
        .map(product => {
            // Match exact base or base-number pattern
            if (product.source_id === baseSourceId) {
                return -1; // Base without number exists, skip it
            }
            const match = product.source_id.match(new RegExp(`^${escapedBase}-(\\d+)$`));
            return match ? parseInt(match[1], 10) : -1;
        })
        .filter(num => num >= 0)
        .sort((a, b) => a - b);

    // Find the next available number
    let nextNumber = 0;
    for (const num of numbers) {
        if (num === nextNumber) {
            nextNumber++;
        } else {
            break;
        }
    }

    return `${baseSourceId}-${nextNumber}`;
}

/**
 * Creates a new product in the database
 */
export async function createProduct(data: CreateProductData, database = db) {
    const { name, tagline, url } = data;

    // Generate base source_id from product URL domain (e.g., arvis.ar -> arvis-ar)
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    const baseSourceId = urlObj.hostname.replace(/\./g, '-');

    // Generate unique source_id with numbering (e.g., clovis-money-0, clovis-money-1)
    const uniqueSourceId = await generateUniqueSourceId(baseSourceId, database);

    const result = await database.insert(stratusProducts).values({
        source_id: uniqueSourceId,
        name,
        tagline,
        url
    }).returning();

    // Sync metrics for the newly created product
    if (result.length > 0) {
        try {
            const newProduct = result[0];
            await syncProductMetrics(newProduct, database);
            logger.info(`Synced metrics for new product: ${newProduct.name}`);
        } catch (error) {
            logger.error(`Failed to sync metrics for new product: ${name}`, error);
            // Don't fail the product creation if metrics sync fails
        }
    }

    return result;
}

/**
 * Updates an existing product in the database
 */
export async function updateProduct(data: UpdateProductData, database = db) {
    const { id, name, tagline, url } = data;

    await database.update(stratusProducts)
        .set({ name, tagline, url })
        .where(eq(stratusProducts.id, id));
}

/**
 * Deletes a product from the database
 */
export async function deleteProduct(id: string, database = db) {
    await database.delete(stratusProducts).where(eq(stratusProducts.id, id));
}

/**
 * Validates product form data
 */
export function validateProductData(formData: FormData): {
    isValid: boolean;
    error?: string;
    data?: CreateProductData | UpdateProductData;
} {
    const name = formData.get('name') as string;
    const tagline = formData.get('tagline') as string;
    const url = formData.get('url') as string;
    const id = formData.get('id') as string;

    if (!name || !tagline || !url) {
        return {
            isValid: false,
            error: 'Product name, tagline, and URL are required'
        };
    }

    const baseData = { name, tagline, url };

    if (id) {
        return {
            isValid: true,
            data: { id, ...baseData } as UpdateProductData
        };
    }

    return {
        isValid: true,
        data: baseData as CreateProductData
    };
}