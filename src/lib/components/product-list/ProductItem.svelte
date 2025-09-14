<script lang="ts">
    import type { Product } from '$lib/types';
    import type { ProductState } from '$lib';
    import { Button } from '$lib';

    interface Props {
        product: Product;
        canEdit: boolean;
        state: ProductState;
        onEdit: (product: Product, state: ProductState) => void;
    }

    let { product, canEdit, state = $bindable(), onEdit }: Props = $props();

    //   H A N D L E R   F U N C T I O N S  ------------------------------ //
    
    // 1. Handle edit button click to open tray

    // ------------------------------------------------------------------- //

    // [ STEP 1. ] - Start editing this product (opens tray)
    function startEdit() {
        console.log('🔧 Starting edit for product:', product.name);
        onEdit(product, state);
        console.log('🔧 Edit state after:', state.editingProductId, state.isAddingProduct);
    }

</script>

<!-- STATE :: EDIT VIEW -->
{#if canEdit}
        <div class="
            flex flex-col sm:flex-row w-full h-fit
            items-start sm:items-center justify-between sm:justify-start
            py-6 gap-6
        ">
            <div class="
                flex flex-col w-full h-fit
                items-start justify-center gap-2
            ">
                <h3 class="title text-primary-fg text-start w-full sm:max-w-md">{product.name}</h3>
                <p class="paragraph text-secondary-fg text-start w-full">{product.tagline}</p>
            </div>
            <Button onClick={startEdit} label="Edit" variant="outlined" />
        </div>

<!-- STATE :: DEFAULT VIEW -->
{:else}
    <a 
        href={product.url}
        target="_blank"
        rel="noopener noreferrer nofollow"
        class="
            flex flex-col sm:flex-row w-full h-fit
            items-start sm:items-center justify-center
            py-6 gap-2 hover:opacity-50
        "
    >
        <h3 class="title text-primary-fg text-start w-full sm:max-w-md" 
            data-text={product.name} 
        >{product.name}</h3>
        <p class="paragraph text-secondary-fg text-start w-full">{product.tagline}</p>
    </a>
{/if}

