<script lang="ts">
    import type { Product } from '$lib/types';
    import type { ProductState } from './productState';
    import { handleEditProduct } from './productState';
    import Button from '../Button.svelte';
    import type { Snippet } from 'svelte';
    import { enhance } from '$app/forms';

    interface Props {
        product: Product;
        canEdit: boolean;
        state: ProductState;
        editButtons?: Snippet;
    }

    let { product, canEdit, state = $bindable(), editButtons }: Props = $props();
</script>

<!-- STATE :: EDIT VIEW -->
{#if canEdit}
    {#if state.editingProductId === product.id}
        <!-- EDITING MODE: Show form fields -->
        <div class="
            flex flex-col w-full h-fit
            items-start justify-start
            py-6 border-l-4 border-blue-500
            bg-blue-50/10 gap-4
        ">
            <div class="flex flex-col w-full gap-3">
                <input 
                    bind:value={state.formData.name}
                    placeholder="Product name"
                    class="w-full px-3 py-2 border border-border rounded bg-secondary-bg text-primary-fg"
                />
                <input 
                    bind:value={state.formData.tagline}
                    placeholder="Product tagline"
                    class="w-full px-3 py-2 border border-border rounded bg-secondary-bg text-primary-fg"
                />
                <input 
                    bind:value={state.formData.url}
                    placeholder="Product Homepage URL"
                    class="w-full px-3 py-2 border border-border rounded bg-secondary-bg text-primary-fg"
                />
            </div>
            <!-- Update Product Form -->
            <form id="updateProductForm" method="POST" action="?/updateProduct" use:enhance={() => {
                return async ({ update }) => {
                    state.editingProductId = null;
                    state.formData = { name: '', tagline: '', url: '' };
                    await update();
                };
            }}>
                <input type="hidden" name="id" value={product.id} />
                <input type="hidden" name="name" bind:value={state.formData.name} />
                <input type="hidden" name="tagline" bind:value={state.formData.tagline} />
                <input type="hidden" name="url" bind:value={state.formData.url} />
            </form>
            
            <!-- Delete Product Form -->
            <form id="deleteProductForm_{product.id}" method="POST" action="?/deleteProduct" use:enhance={() => {
                return async ({ update }) => {
                    state.editingProductId = null;
                    await update();
                };
            }}>
                <input type="hidden" name="id" value={product.id} />
            </form>
            
            {@render editButtons?.()}
        </div>
    {:else}
        <!-- NORMAL EDIT MODE: Show product with edit button -->
        <div class="
            flex flex-col sm:flex-row w-full h-fit
            items-start sm:items-center justify-between sm:justify-start
            py-6 gap-6
        ">
            <div class="
                flex flex-col w-full h-fit
                items-start justify-center
                gap-2
            ">
                <h3 class="title text-primary-fg text-start w-full sm:max-w-md">{product.name}</h3>
                <p class="paragraph text-secondary-fg text-start w-full">{product.tagline}</p>
            </div>
            <Button onClick={() => handleEditProduct(product, state)} label="Edit" variant="outlined" />
        </div>
    {/if}

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

