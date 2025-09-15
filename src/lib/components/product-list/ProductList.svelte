<script lang="ts">
    import { 
        authStore,
        Button,
        handleEditProduct,
        handleAddProduct,
        addProduct,
        saveProduct,
        deleteProduct,
        handleCancelEdit
    } from '$lib';
    import type { Product, ProductState } from '$lib';
    import ProductItem from './ProductItem.svelte';
    import ProductTray from './ProductTray.svelte';

    interface Props {
        products: Product[];
        error?: string | null;
        isAuthenticated?: boolean;
    }

    let { products = [], error = null, isAuthenticated = false }: Props = $props();

    //   S T A T E   M A N A G E M E N T  ------------------------------ //
    
    // 1. Get auth state from store
    // 2. Determine if edit mode is available
    // 3. Create product state and derived values

    // ------------------------------------------------------------------- //

    // [ STEP 1. ] - Get auth state from store
    let authState = $derived($authStore);
    
    // [ STEP 2. ] - Determine if edit mode is available
    let canEdit = $derived(isAuthenticated || authState.isAuthenticated);
    
    // [ STEP 3. ] - Create product state and derived values
    let productState: ProductState = $state({
        editingProductId: null,
        isAddingProduct: false,
        formData: {
            name: '',
            tagline: '',
            url: ''
        }
    });

    // Derived tray state
    let isTrayOpen = $derived(productState.editingProductId !== null || productState.isAddingProduct);
    let editingProduct = $derived(
        productState.editingProductId 
            ? products.find(p => p.id === productState.editingProductId) || null
            : null
    );

    //   H A N D L E R   F U N C T I O N S  ------------------------------ //

    // Handle tray save (either edit or add)
    async function handleTraySave(product: Product | null, state: ProductState) {
        if (product) {
            await saveProduct(product, state);
        } else {
            await addProduct(state);
        }
    }
</script>

<div class="
    flex flex-col w-full h-fit
    items-center justify-center gap-12
">
    <div class="
        flex flex-col w-full h-fit
        items-center justify-center select-none
        border-border border-b-1
    ">
        {#each products as product}
            <div class="w-full border-t-1 border-border"></div>
            
            <ProductItem 
                {product} 
                {canEdit} 
                bind:state={productState}
                onEdit={handleEditProduct}
            />

        {/each}

        <!-- STATE :: ERROR || NO PRODUCTS -->
        {#if products.length === 0}
            <div class="w-full border-t-1 border-border"></div>
            <div class="
                flex flex-col w-full h-fit
                items-center justify-center
                py-9
            ">
                {#if error}
                    <h3 class="title text-secondary-fg text-center">{error}</h3>
                {:else}
                    <h3 class="title text-secondary-fg text-center">No Products Yet</h3>
                {/if}
            </div>
        {/if}
    </div>

    <!-- STATE :: EDIT VIEW :: ADD NEW PRODUCT (SHOW AFTER ALL PRODUCTS) -->
    {#if canEdit && products.length > 0}
        <Button 
            onClick={() => handleAddProduct(productState)} 
            label="Add New Product" 
            shimmer={true}
        />
    {/if}
</div>


<!-- Product Tray -->
<ProductTray 
    isOpen={isTrayOpen}
    product={editingProduct}
    bind:state={productState}
    onSave={handleTraySave}
    onDelete={deleteProduct}
    onCancel={handleCancelEdit}
/>
