import type { Product } from '$lib/types';
import { invalidateAll } from '$app/navigation';
import { enhance } from '$app/forms';

//  P R O D U C T   S T A T E   M A N A G E M E N T  --------------------- //

// 1. Define state interface
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

//  H A N D L E R   F U N C T I O N S  ----------------------------------- //

// 1. Product editing functions
// 2. Product CRUD operations  
// 3. Form state management
// 4. Product item operations

// --------------------------------------------------------------------- //

// [ STEP 1. ] - Start editing a product
export function handleEditProduct(product: Product, state: ProductState): void {
    state.editingProductId = product.id;
    state.formData.name = product.name;
    state.formData.tagline = product.tagline;
    state.formData.url = product.url || '';
}

// [ STEP 2. ] - Start adding a new product
export function handleAddProduct(state: ProductState): void {
    state.isAddingProduct = true;
    state.formData.name = '';
    state.formData.tagline = '';
    state.formData.url = '';
}

// [ STEP 3. ] - Save product changes (via enhanced form submission)
export async function saveProduct(product: Product, state: ProductState): Promise<void> {
    
    // 1. Validate required fields
    // 2. Create enhanced form with no page reload
    // 3. Submit form data to SvelteKit action
    // 4. Refresh data and reset state

    // ------------------------------------------------------------------- //

    // [ STEP 1. ] - Validate required fields
    if (!state.formData.name.trim()) {
        alert('Product name is required');
        return;
    }
    
    if (!state.formData.tagline.trim()) {
        alert('Product tagline is required');
        return;
    }

    try {
        // [ STEP 1. ] - Create temporary form for update action
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = '?/updateProduct';
        form.style.display = 'none';
        
        // [ STEP 2. ] - Add form fields
        const fields = {
            id: product.id,
            name: state.formData.name,
            tagline: state.formData.tagline,
            url: formatUrl(state.formData.url)
        };
        
        Object.entries(fields).forEach(([key, value]) => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = value;
            form.appendChild(input);
        });
        
        // [ STEP 3. ] - Enhance form to prevent page reload
        document.body.appendChild(form);
        
        // Use enhance to submit without page reload
        const enhancedSubmit = enhance(form, () => {
            return async ({ update }) => {
                // Update page data without full reload
                await update();
                // Keep admin state and just refresh product data
                await invalidateAll();
            };
        });
        
        form.requestSubmit();
        document.body.removeChild(form);
        
        // Reset local state
        state.editingProductId = null;
        state.formData = { name: '', tagline: '', url: '' };
        
    } catch (error) {
        alert('Error saving product changes');
    }
}

// [ STEP 4. ] - Delete product with confirmation
export async function deleteProduct(product: Product, state: ProductState): Promise<void> {
    
    // 1. Confirm deletion
    // 2. Create enhanced form with no page reload
    // 3. Reset state

    // ------------------------------------------------------------------- //

    // [ STEP 1. ] - Confirm deletion
    if (!confirm(`Are you sure you want to delete "${product.name}"?`)) {
        return;
    }

    try {
        // [ STEP 2. ] - Create temporary form for delete action
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = '?/deleteProduct';
        form.style.display = 'none';
        
        // Add product ID
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = 'id';
        input.value = product.id;
        form.appendChild(input);
        
        // [ STEP 3. ] - Enhance form to prevent page reload
        document.body.appendChild(form);
        
        // Use enhance to submit without page reload
        const enhancedSubmit = enhance(form, () => {
            return async ({ update }) => {
                // Update page data without full reload
                await update();
                // Keep admin state and just refresh product data
                await invalidateAll();
            };
        });
        
        form.requestSubmit();
        document.body.removeChild(form);
        
        // Reset state
        state.editingProductId = null;
        
    } catch (error) {
        alert('Error deleting product');
    }
}

// [ STEP 5. ] - Cancel editing and reset form
export function handleCancelEdit(state: ProductState): void {
    state.editingProductId = null;
    state.isAddingProduct = false;
    state.formData = { name: '', tagline: '', url: '' };
}

// [ STEP 6. ] - Add new product (via enhanced form submission)
export async function addProduct(state: ProductState): Promise<void> {
    
    // 1. Validate required fields
    // 2. Create enhanced form with no page reload
    // 3. Submit form data to SvelteKit action
    // 4. Reset state

    // ------------------------------------------------------------------- //

    // [ STEP 1. ] - Validate required fields
    if (!state.formData.name.trim()) {
        alert('Product name is required');
        return;
    }
    
    if (!state.formData.tagline.trim()) {
        alert('Product tagline is required');
        return;
    }

    try {
        // [ STEP 1. ] - Create temporary form for create action
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = '?/createProduct';
        form.style.display = 'none';
        
        // [ STEP 2. ] - Add form fields
        const fields = {
            name: state.formData.name,
            tagline: state.formData.tagline,
            url: formatUrl(state.formData.url)
        };
        
        Object.entries(fields).forEach(([key, value]) => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = value;
            form.appendChild(input);
        });
        
        // [ STEP 3. ] - Enhance form to prevent page reload
        document.body.appendChild(form);
        
        // Use enhance to submit without page reload
        const enhancedSubmit = enhance(form, () => {
            return async ({ update }) => {
                // Update page data without full reload
                await update();
                // Keep admin state and just refresh product data
                await invalidateAll();
            };
        });
        
        form.requestSubmit();
        document.body.removeChild(form);
        
        // Reset state
        state.isAddingProduct = false;
        state.formData = { name: '', tagline: '', url: '' };
        
    } catch (error) {
        alert('Error adding product');
    }
}


//  U T I L I T Y   F U N C T I O N S  ----------------------------------- //

// 1. Shimmer width calculation for responsive design
// 2. URL formatting to ensure https:// prefix

// --------------------------------------------------------------------- //

// [ STEP 1. ] - Format URL to ensure it has https:// prefix
function formatUrl(url: string): string {
    
    // 1. Return empty string if URL is empty
    // 2. Add https:// if no protocol is present
    // 3. Return URL as-is if it already has a protocol

    // ------------------------------------------------------------------- //

    // [ STEP 1. ] - Return empty string if URL is empty
    if (!url || !url.trim()) {
        return '';
    }

    // [ STEP 2. ] - Add https:// if no protocol is present
    const trimmedUrl = url.trim();
    if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
        return `https://${trimmedUrl}`;
    }

    // [ STEP 3. ] - Return URL as-is if it already has a protocol
    return trimmedUrl;
}

// [ STEP 2. ] - Calculate shimmer width based on screen size
export function getShimmerWidth(): string {
    
    // 1. Check for server-side rendering
    // 2. Return responsive width based on screen size

    // ------------------------------------------------------------------- //

    // [ STEP 1. ] - Check for server-side rendering
    if (typeof window === 'undefined') return '200%';
    
    // [ STEP 2. ] - Return responsive width based on screen size
    // Use 300% for mobile to maintain animation speed
    return window.innerWidth < 768 ? '300%' : '200%';
}
