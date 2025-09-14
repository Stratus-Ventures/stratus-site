<script lang="ts">
    import type { ProductState } from './productState';
    import { handleAddProduct } from './productState';
    import type { Snippet } from 'svelte';
    import { enhance } from '$app/forms';

    interface Props {
        state: ProductState;
        shimmerWidth: string;
        buttons?: Snippet;
    }

    let { state = $bindable(), shimmerWidth, buttons }: Props = $props();
</script>

{#if state.isAddingProduct}
    <!-- ADDING MODE: Show form fields -->
    <div class="
        flex flex-col w-full h-fit
        items-start justify-start
        py-6 border-l-4 border-green-500
        bg-green-50/10 gap-4
    ">
        <h3 class="title text-primary-fg">Add New Product</h3>
        <div class="flex flex-col w-full gap-3">
            <input 
                id="new-product-name"
                name="new-product-name"
                bind:value={state.formData.name}
                placeholder="Product name"
                class="w-full px-3 py-2 border border-border rounded bg-secondary-bg text-primary-fg"
            />
            <input 
                id="new-product-tagline"
                name="new-product-tagline"
                bind:value={state.formData.tagline}
                placeholder="Product tagline"
                class="w-full px-3 py-2 border border-border rounded bg-secondary-bg text-primary-fg"
            />
            <input 
                id="new-product-url"
                name="new-product-url"
                bind:value={state.formData.url}
                placeholder="Product URL"
                class="w-full px-3 py-2 border border-border rounded bg-secondary-bg text-primary-fg"
            />
        </div>
        <!-- Create Product Form -->
        <form id="createProductForm" method="POST" action="?/createProduct" use:enhance={() => {
            return async ({ update }) => {
                state.isAddingProduct = false;
                state.formData = { name: '', tagline: '', url: '' };
                await update();
            };
        }}>
            <input type="hidden" name="name" bind:value={state.formData.name} />
            <input type="hidden" name="tagline" bind:value={state.formData.tagline} />
            <input type="hidden" name="url" bind:value={state.formData.url} />
        </form>
        
        {@render buttons?.()}
    </div>
{:else}
    <!-- NORMAL MODE: Show add button -->
    <button 
        onclick={() => handleAddProduct(state)}
        class="
            flex flex-col w-full h-fit
            items-center justify-start
            py-9.5 hover:bg-secondary-bg
            cursor-pointer
    ">
        <h3 class="
                title shimmer-text text-primary-fg 
                text-center select-none" 
            data-text="Add New Product" 
            style="--shimmer-width: {shimmerWidth}
        ">Add New Product</h3>
    </button>
{/if}

<style>
    .shimmer-text {
        position: relative;
        color: var(--color-primary-fg);
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-rendering: optimizeLegibility;
    }

    .shimmer-text::before {
        content: attr(data-text);
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent 0%, transparent 20%, var(--color-primary-fg) 50%, transparent 80%, transparent 100%);
        background-size: var(--shimmer-width) 100%;
        background-repeat: no-repeat;
        background-position: 200% 0;
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        pointer-events: none;
        opacity: 1;
    }

    button:hover .shimmer-text {
        color: var(--color-primary-fg-50);
    }

    button:hover .shimmer-text::before {
        animation: shimmer 2.2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
    }

    @keyframes shimmer {
        0% {
            background-position: 160% 0;
        }
        100% {
            background-position: -60% 0;
        }
    }
</style>
