<script lang="ts">

    // 1. Display products in a clean list
    // 2. Handle loading and error states

    // ----------------------------------------------------------- //

    // [ STEP 1. ]
    /** @type {Product[]} */
    let { products = [] } = $props();

</script>

<div class="
    flex flex-col w-full h-fit
    items-center justify-start
    border-b border-border theme-transition
">
    {#each products as product}
        <a 
            href={product.url}
            class="
                flex flex-row w-full h-fit
                items-center justify-start
                py-4
                border-t border-border
                hover:opacity-50
            "
        >
            <h4 class="title text-primary-fg mr-42">
                {product.name}
            </h4>

            <span class="paragraph text-secondary-fg">
                {product.tagline}
            </span>
        </a>
    {/each}
</div>