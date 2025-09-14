<script lang="ts">
    import type { Product, ProductState } from '$lib';
    import { Button, IconButton } from '$lib';
	import CloseDrawer from '../icons/CloseDrawer.svelte';

    interface Props {
        isOpen: boolean;
        product?: Product | null;
        state: ProductState;
        onSave: (product: Product | null, state: ProductState) => Promise<void>;
        onDelete?: (product: Product, state: ProductState) => Promise<void>;
        onCancel: (state: ProductState) => void;
    }

    let { isOpen, product = null, state = $bindable(), onSave, onDelete, onCancel }: Props = $props();

    //   H A N D L E R   F U N C T I O N S  ------------------------------ //
    
    // 1. Handle save button click
    // 2. Handle delete button click  
    // 3. Handle cancel button click
    // 4. Handle backdrop click

    // ------------------------------------------------------------------- //

    // [ STEP 1. ] - Handle save button click
    async function handleSave() {
        await onSave(product, state);
    }

    // [ STEP 2. ] - Handle delete button click
    async function handleDelete() {
        if (product && onDelete) {
            await onDelete(product, state);
        }
    }

    // [ STEP 3. ] - Handle cancel and backdrop clicks
    function handleCancel() {
        onCancel(state);
    }

    // [ STEP 4. ] - Determine if this is editing or adding
    let isEditing = $derived(!!product);
</script>

<!-- Backdrop -->
{#if isOpen}
    <div 
        class="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
        role="button"
        tabindex="0"
        onclick={handleCancel}
        onkeydown={(e) => e.key === 'Escape' && handleCancel()}
    ></div>
{/if}

<!-- Sliding Tray -->
<div class="
    fixed bottom-0 left-0 right-0 z-50
    transform transition-transform duration-300 ease-out
    {isOpen ? 'translate-y-0' : 'translate-y-full'}
">
    <div 
        class="
            w-full max-w-2xl mx-auto
            bg-primary-bg border-x-1 border-t-1 border-border
            rounded-t-2xl
            px-5 sm:px-8 pt-5 sm:pt-8 pb-24" 
        role="dialog" 
        aria-modal="true"
        tabindex="-1"
        onclick={(e) => e.stopPropagation()}
        onkeydown={() => {}}
    >
        <!-- Header -->
        <div class="flex flex-col gap-6 w-full h-fit">
            <div class="flex items-center justify-between">
                <h2 class="font-sans font-medium text-lg text-primary-fg tracking-tight leading-tight">
                    {isEditing ? 'Edit Product' : 'Add New Product'}
                </h2>
                <IconButton
                    size={20}
                    onClick={handleCancel}
                    icon={CloseDrawer}
                    ariaLabel="Close dialog"
                />
            </div>

            <!-- Form Fields -->
            <div class="flex flex-col justify-between gap-8">
                <!-- Fields -->
                <div class="flex flex-col w-full gap-3">
                    <input 
                        bind:value={state.formData.name}
                        placeholder="Product name"
                        class="w-full px-4 py-3 border border-border rounded-lg 
                               bg-secondary-bg text-primary-fg
                               hover:bg-transparent
                               focus:border-secondary-fg focus:outline-none
                               transition-colors"
                    />
                    
                    <input 
                        bind:value={state.formData.tagline}
                        placeholder="Product tagline"
                        class="w-full px-4 py-3 border border-border rounded-lg 
                               bg-secondary-bg text-primary-fg
                               hover:bg-transparent
                               focus:border-secondary-fg focus:outline-none
                               transition-colors"
                    />

                    <input 
                        bind:value={state.formData.url}
                        placeholder="https://example.com"
                        class="w-full px-4 py-3 border border-border rounded-lg 
                               bg-secondary-bg text-primary-fg
                               hover:bg-transparent
                               focus:border-secondary-fg focus:outline-none
                               transition-colors"
                    />
                </div>

                <!-- Action Buttons -->
                <div class="flex flex-col sm:flex-row gap-3 sm:items-start">
                    <Button onClick={handleSave} label="Save" variant="filled" />
                    {#if isEditing && onDelete}
                        <Button onClick={handleDelete} label="Delete" variant="outlined" />
                    {/if}
                    <Button onClick={handleCancel} label="Cancel" variant="outlined" />
                </div>
            </div>
        </div>
    </div>
</div>
