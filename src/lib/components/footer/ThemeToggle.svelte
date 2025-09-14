<script lang="ts">
    import { browser } from '$app/environment';
    import { Sun, Moon } from '$lib';

    type Mode = 'light' | 'dark' | 'system';
    let isHovered = $state(false);

    // 1. Start from saved choice or system preference
    // 2. Apply whenever things change (client)
    // 3. Live OS updates while in "system"
    // 4. Single toggle: flip light ↔ dark; persist ONLY on user action

    // ----------------------------------------------------------- //

    // [ STEP 1. ]
    let mode = $state<Mode>(browser ? (localStorage.theme as Mode) ?? 'system' : 'system');
    let mq: MediaQueryList | null = browser ? matchMedia('(prefers-color-scheme: dark)') : null;

    // [ STEP 2. ]   
    function applyCurrent() {
        if (!browser) return;
        const isDark =
        mode === 'dark' || (mode === 'system' && !!mq?.matches);
        document.documentElement.classList.toggle('dark', isDark);
    }
    $effect(() => { applyCurrent(); });

    // [ STEP 3. ]  
    $effect(() => {
        if (!browser || !mq) return;
        const onChange = () => { if (mode === 'system') applyCurrent(); };
        mq.addEventListener('change', onChange);
        return () => mq.removeEventListener('change', onChange);
    });

    // [ STEP 4. ]  
    function toggle() {
        if (!browser) return;
        const isDarkNow = document.documentElement.classList.contains('dark');
        mode = isDarkNow ? 'light' : 'dark';
        localStorage.theme = mode;
        applyCurrent();
    }

</script>


<button 
    class="
      p-1 w-fit h-fit flex items-center justify-center cursor-pointer" 
    aria-label="Toggle theme" 
    onclick={toggle}
    onmouseenter={() => isHovered = true}
    onmouseleave={() => isHovered = false}
>
    {#if mode === 'light'}
      <Sun 
        size={20}
        color={isHovered ? 'var(--color-primary-fg)' : 'var(--color-secondary-fg)'}
        {isHovered}
      />
    {:else}
      <Moon 
        size={20}
        color={isHovered ? 'var(--color-primary-fg)' : 'var(--color-secondary-fg)'}
        {isHovered}
      />
    {/if}
</button>

