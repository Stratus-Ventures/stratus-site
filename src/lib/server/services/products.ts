import { db, stratusProducts } from '$lib/server';
import { eq } from 'drizzle-orm';

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
 * Creates a new product in the database
 */
export async function createProduct(data: CreateProductData, database = db) {
    const { name, tagline, url } = data;

    // Generate source_id from product name-domain format (replace . with -)
    const sourceId = name.toLowerCase().replace(/\./g, '-');

    const result = await database.insert(stratusProducts).values({
        source_id: sourceId,
        name,
        tagline,
        url
    }).returning();

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