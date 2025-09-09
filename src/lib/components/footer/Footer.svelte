<script lang="ts">

	import { ThemeToggle, IconButton, Email, X } from "$lib";
    
</script>


<footer class="
    flex flex-row w-full h-fit
    items-center justify-between
    pb-16 gap-4
">

    <span class="small text-secondary-fg align-middle select-none">© 2025 Stratus Ventures LLC</span>

    <div class="flex items-center gap-3">
        <ThemeToggle />
        <IconButton 
            icon={Email} 
            href="mailto:contact@stratusventures.com" 
            ariaLabel="Send email" 
        />
        <IconButton 
            icon={X} 
            href="https://x.com/stratusventures" 
            ariaLabel="Follow on X" 
        />
    </div>
    
</footer>