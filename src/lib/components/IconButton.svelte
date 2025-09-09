<script lang="ts">

    interface Props {
        icon: any;
        href?: string;
        onClick?: () => void;
        size?: number;
        ariaLabel: string;
    }

    let { 
        icon: IconComponent, 
        href, 
        onClick, 
        size = 16 , 
        ariaLabel 
    }: Props = $props();

    // 1. Handle hover state for icon color changes

    // ----------------------------------------------------------- //

    // [ STEP 1. ]
    let isHovered = $state(false);

</script>


{#if href}
    {@const Icon = IconComponent}
    <a 
        {href}
        class="
            p-1 w-fit h-fit flex items-center justify-center 
            transition-colors duration-200 cursor-pointer" 
        aria-label={ariaLabel}
        target="_blank"
        rel="noopener noreferrer"
        onmouseenter={() => isHovered = true}
        onmouseleave={() => isHovered = false}
    >
        <Icon
            {size}
            color={isHovered ? 'var(--color-primary-fg)' : 'var(--color-secondary-fg)'}
            {isHovered}
        />
    </a>
{:else}
    {@const Icon = IconComponent}
    <button 
        class="
            p-1 w-fit h-fit flex items-center justify-center 
            transition-colors duration-200 cursor-pointer" 
        aria-label={ariaLabel}
        onclick={onClick}
        onmouseenter={() => isHovered = true}
        onmouseleave={() => isHovered = false}
    >
        <Icon
            {size}
            color={isHovered ? 'var(--color-primary-fg)' : 'var(--color-secondary-fg)'}
            {isHovered}
        />
    </button>
{/if}