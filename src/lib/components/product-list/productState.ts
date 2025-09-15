import type { Product } from '$lib/types';
import { invalidateAll } from '$app/navigation';
import { enhance } from '$app/forms';

//  P R O D U C T   S T A T E   M A N A G E M E N T  --------------------- //

// 1. Define state interfaces
// 2. Create state management functions
// 3. Handle CRUD operations
// 4. Utility functions

// --------------------------------------------------------------------- //

export interface ProductFormData {
    name: string;
    tagline: string;
    url: string;
}

export interface ProductState {
    editingProductId: string | null;
    isAddingProduct: boolean;
    formData: ProductFormData;
}

//  U T I L I T Y   F U N C T I O N S  ----------------------------------- //

// 1. Form submission with enhanced functionality
// 2. URL formatting to ensure https:// prefix
// 3. Form validation with custom alerts

// --------------------------------------------------------------------- //

// [ STEP 1. ] - Create and submit a form with enhanced functionality to prevent page reloads
async function submitForm(action: string, fields: Record<string, string>): Promise<void> {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = action;
    form.style.display = 'none';
    
    Object.entries(fields).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value;
        form.appendChild(input);
    });
    
    document.body.appendChild(form);
    
    const enhancedSubmit = enhance(form, () => {
        return async ({ update }) => {
            await update();
            await invalidateAll();
        };
    });
    
    form.requestSubmit();
    document.body.removeChild(form);
}

// [ STEP 2. ] - Format URL to ensure https:// prefix
function formatUrl(url: string): string {
    if (!url?.trim()) return '';
    const trimmedUrl = url.trim();
    if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
        return `https://${trimmedUrl}`;
    }
    return trimmedUrl;
}

// [ STEP 3. ] - Validate required form fields with browser alerts
function validateRequired(name: string, tagline: string): boolean {
    if (!name.trim()) {
        alert('Product name is required');
        return false;
    }
    if (!tagline.trim()) {
        alert('Product tagline is required');
        return false;
    }
    return true;
}

//  H A N D L E R   F U N C T I O N S  ----------------------------------- //

// 1. Product editing functions
// 2. Product CRUD operations  
// 3. Form state management
// 4. Product item operations

// --------------------------------------------------------------------- //

// [ STEP 1. ] - Start editing a product
export function handleEditProduct(product: Product, state: ProductState): void {
    state.editingProductId = product.id;
    state.formData = {
        name: product.name,
        tagline: product.tagline,
        url: product.url || ''
    };
}

// [ STEP 2. ] - Start adding a new product
export function handleAddProduct(state: ProductState): void {
    state.isAddingProduct = true;
    state.formData = { name: '', tagline: '', url: '' };
}

// [ STEP 3. ] - Save product changes (via enhanced form submission)
export async function saveProduct(product: Product, state: ProductState): Promise<void> {
    if (!validateRequired(state.formData.name, state.formData.tagline)) return;

    try {
        await submitForm('?/updateProduct', {
            id: product.id,
            name: state.formData.name,
            tagline: state.formData.tagline,
            url: formatUrl(state.formData.url)
        });
        
        state.editingProductId = null;
        state.formData = { name: '', tagline: '', url: '' };
    } catch (error) {
        alert('Error saving product changes');
    }
}

// [ STEP 4. ] - Delete product with confirmation
export async function deleteProduct(product: Product, state: ProductState): Promise<void> {
    if (!confirm(`Are you sure you want to delete "${product.name}"?`)) return;

    try {
        await submitForm('?/deleteProduct', { id: product.id });
        state.editingProductId = null;
    } catch (error) {
        alert('Error deleting product');
    }
}

// [ STEP 5. ] - Add new product (via enhanced form submission)
export async function addProduct(state: ProductState): Promise<void> {
    if (!validateRequired(state.formData.name, state.formData.tagline)) return;

    try {
        await submitForm('?/createProduct', {
            name: state.formData.name,
            tagline: state.formData.tagline,
            url: formatUrl(state.formData.url)
        });
        
        state.isAddingProduct = false;
        state.formData = { name: '', tagline: '', url: '' };
    } catch (error) {
        alert('Error adding product');
    }
}

// [ STEP 6. ] - Cancel editing and reset form
export function handleCancelEdit(state: ProductState): void {
    state.editingProductId = null;
    state.isAddingProduct = false;
    state.formData = { name: '', tagline: '', url: '' };
}

// [ STEP 7. ] - Calculate shimmer width based on screen size
export function getShimmerWidth(): string {
    if (typeof window === 'undefined') return '200%';
    return window.innerWidth < 768 ? '300%' : '200%';
}