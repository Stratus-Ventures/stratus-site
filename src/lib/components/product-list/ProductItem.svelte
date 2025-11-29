<script lang="ts">
	import type { Product } from '$lib/types';
	import type { ProductState } from '$lib';
	import { Button, cn } from '$lib';

	interface Props {
		product: Product;
		canEdit: boolean;
		state: ProductState;
		onEdit: (product: Product, state: ProductState) => void;
	}

	let { product, canEdit, state: productState = $bindable(), onEdit }: Props = $props();

	//   H A N D L E R   F U N C T I O N S  ------------------------------ //

	// 1. Handle edit button click to open tray

	// ------------------------------------------------------------------- //

	// [ STEP 1. ] - Start editing this product (opens tray)
	function startEdit() {
		onEdit(product, productState);
	}
</script>

<!-- STATE :: EDIT VIEW -->
{#if canEdit}
	<div
		class="
						transition-opacity duration-300 ease-in-out
            flex h-fit w-full flex-col items-start
            justify-between gap-6 py-6 sm:flex-row
            sm:items-center sm:justify-start
        "
	>
		<div
			class="
                flex h-fit w-full flex-col
                items-start justify-center gap-2
            "
		>
			<h3 class="title w-full text-start text-primary-fg sm:max-w-md">{product.name}</h3>
			<p class="paragraph w-full text-start text-secondary-fg">{product.tagline}</p>
		</div>

		<div class={cn("w-full sm:w-fit")}>
			<Button onClick={startEdit} label="Edit" variant="outlined" />
		</div>
	</div>

	<!-- STATE :: DEFAULT VIEW -->
{:else}
	<a
		href={product.url}
		target="_blank"
		rel="noopener noreferrer nofollow"
		class="
						transition-opacity duration-300 ease-in-out
            flex h-fit w-full flex-col items-start
            justify-center gap-2 py-6
            hover:opacity-50 sm:flex-row sm:items-center
        "
	>
		<h3 class="title w-full text-start text-primary-fg sm:max-w-sm" data-text={product.name}>
			{product.name}
		</h3>
		<p class="paragraph w-full text-start text-secondary-fg">{product.tagline}</p>
	</a>
{/if}
