<script lang="ts">

    interface Props {
        label: string;
        href?: string;
        variant?: 'outlined' | 'filled';
        shimmer?: boolean;
    }
    
    let { label, href, variant = 'filled' }: Props = $props();
    
    let classes = $derived(`
        w-full md:w-fit h-fit items-center justify-center
        px-6 py-3 rounded-lg button-label

        ${variant === 'outlined'
            ? 'bg-transparent border border-border text-button-fg-inv'
            : 'bg-button-bg border border-button-bg text-button-fg'}
    `);

</script>


{#if href}
    <a href={href} class={classes}>
        {label}
    </a>
{:else}
    <button class={classes}>
        {label}
    </button>
{/if}
