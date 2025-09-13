<script lang="ts">
    import { authStore } from '$lib';
    import type { Product } from '$lib/types';
    import Button from '../Button.svelte';
    import ProductItem from './ProductItem.svelte';
    import ProductForm from './ProductForm.svelte';
    import type { ProductState } from './productState';
    import { handleSaveProduct, handleDeleteProduct, handleCancelEdit, getShimmerWidth } from './productState';

    interface Props {
        products: Product[];
        error?: string | null;
        isAuthenticated?: boolean;
    }

    let { products = [], error = null, isAuthenticated = false }: Props = $props();

    //   H A N D L E R   F U N C T I O N S  ------------------------------ //
    
    // 1. Get auth state from store
    // 2. Determine if edit mode is available
    // 3. Handle authentication logging

    // ------------------------------------------------------------------- //

    // [ STEP 1. ] - Get auth state from store
    let authState = $derived($authStore);
    
    // [ STEP 2. ] - Determine if edit mode is available
    let canEdit = $derived(isAuthenticated || authState.isAuthenticated);
    
    // [ STEP 3. ] - Handle authentication logging and show auth button
    $effect(() => {
        if (canEdit) {
            console.log('✅ ProductList: Edit mode available');
        } else {
            console.log('ℹ️  ProductList: Read-only mode');
        }
    });

    //   S T A T E   M A N A G E M E N T  ------------------------------ //

    let productState: ProductState = $state({
        editingProductId: null,
        isAddingProduct: false,
        formData: {
            name: '',
            tagline: '',
            url: ''
        }
    });

    //   U T I L I T Y   F U N C T I O N S  ------------------------------ //

    let shimmerWidth = $derived.by(() => getShimmerWidth());
</script>

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
        >
            {#snippet editButtons()}
                <div class="flex gap-2">
                    <Button onClick={() => handleSaveProduct(productState)} label="Save" variant="filled" />
                    <Button onClick={() => handleDeleteProduct(product.id)} label="Delete" variant="outlined" />
                    <Button onClick={() => handleCancelEdit(productState)} label="Cancel" variant="outlined" />
                </div>
            {/snippet}
        </ProductItem>
    {/each}

    <!-- STATE :: EDIT VIEW :: ADD NEW PRODUCT (SHOW AFTER ALL PRODUCTS) -->
    {#if canEdit && products.length > 0}
        <div class="w-full border-t-1 border-border"></div>
        
        <ProductForm bind:state={productState} {shimmerWidth}>
            {#snippet buttons()}
                <div class="flex gap-2">
                    <Button onClick={() => handleSaveProduct(productState)} label="Save" variant="filled" />
                    <Button onClick={() => handleCancelEdit(productState)} label="Cancel" variant="outlined" />
                </div>
            {/snippet}
        </ProductForm>
    {/if}

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
