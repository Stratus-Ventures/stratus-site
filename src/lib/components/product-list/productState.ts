import type { Product } from '$lib/types';

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

export function handleEditProduct(product: Product, state: ProductState): void {
    state.editingProductId = product.id;
    state.formData.name = product.name;
    state.formData.tagline = product.tagline;
    state.formData.url = product.url || '';
}

export function handleAddProduct(state: ProductState): void {
    state.isAddingProduct = true;
    state.formData.name = '';
    state.formData.tagline = '';
    state.formData.url = '';
}

export function handleSaveProduct(state: ProductState): void {
    // The actual save will be handled by SvelteKit form actions
    // This triggers the form submission which calls the server action
    if (state.editingProductId) {
        // Update existing product
        const form = document.getElementById('updateProductForm') as HTMLFormElement;
        form?.requestSubmit();
    } else {
        // Create new product
        const form = document.getElementById('createProductForm') as HTMLFormElement;
        form?.requestSubmit();
    }
}

export function handleDeleteProduct(productId: string): void {
    // The actual delete will be handled by SvelteKit form action
    const form = document.getElementById(`deleteProductForm_${productId}`) as HTMLFormElement;
    form?.requestSubmit();
}

export function handleCancelEdit(state: ProductState): void {
    state.editingProductId = null;
    state.isAddingProduct = false;
    state.formData = { name: '', tagline: '', url: '' };
}

//  U T I L I T Y   F U N C T I O N S  ----------------------------------- //

export function getShimmerWidth(): string {
    if (typeof window === 'undefined') return '200%';
    // Use 300% for mobile to maintain speed
    return window.innerWidth < 768 ? '300%' : '200%';
}
