<script lang="ts">
	import { slide, fade } from 'svelte/transition';
	import type { Product, ProductState } from '$lib';
	import { Button, IconButton, CloseDrawer } from '$lib';

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
	// 4. Determine if this is editing or adding

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

{#if isOpen}
	<!-- BACKDROP -->
	<div
		class="fixed inset-0 z-10 bg-black/50"
		transition:fade={{ duration: 200 }}
		role="button"
		tabindex="0"
		onclick={handleCancel}
		onkeydown={(e) => {
			if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
				handleCancel();
			}
		}}
	></div>

	<!-- SLIDING TRAY -->
	<div class="fixed right-0 bottom-0 left-0 z-20" transition:slide={{ duration: 300 }}>
		<div
			class="mx-auto w-full max-w-4xl rounded-t-2xl border-t-1 border-border bg-primary-bg
            px-5 pt-5 pb-24 shadow-lg sm:px-8 sm:pt-8"
			role="dialog"
			aria-modal="true"
			tabindex="-1"
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => e.stopPropagation()}
		>
			<!-- HEADER -->
			<div class="flex h-fit w-full flex-col gap-5">
				<div class="flex items-center justify-between">
					<h2 class="h2 text-primary-fg">
						{isEditing ? 'Edit Product' : 'Add New Product'}
					</h2>
					<IconButton
						size={20}
						onClick={handleCancel}
						icon={CloseDrawer}
						ariaLabel="Close dialog"
					/>
				</div>

				<!-- FORM CONTAINER -->
				<div class="flex flex-col justify-start gap-8">
					<!-- FIELDS -->
					<div class="flex w-full flex-col gap-3">
						<input
							bind:value={state.formData.name}
							placeholder="Product name"
							class="w-full rounded-lg border border-border bg-secondary-bg px-4
                            py-3 text-primary-fg
                            transition-colors
                            hover:bg-transparent focus:border-secondary-fg
                            focus:outline-none"
						/>

						<input
							bind:value={state.formData.tagline}
							placeholder="Product tagline"
							class="w-full rounded-lg border border-border bg-secondary-bg px-4
                            py-3 text-primary-fg
                            transition-colors
                            hover:bg-transparent focus:border-secondary-fg
                            focus:outline-none"
						/>

						<input
							bind:value={state.formData.url}
							placeholder="https://example.com"
							required
							class="w-full rounded-lg border border-border bg-secondary-bg px-4
                            py-3 text-primary-fg
                            transition-colors
                            hover:bg-transparent focus:border-secondary-fg
                            focus:outline-none"
						/>
					</div>

					<!-- ACTIONS BUTTON -->
					<div class="flex flex-row gap-3 sm:items-start">
						<Button onClick={handleSave} label="Save" variant="filled" />
						{#if isEditing && onDelete}
							<Button onClick={handleDelete} label="Delete" variant="outlined" />
						{/if}
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}
