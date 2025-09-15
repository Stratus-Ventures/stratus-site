<script lang="ts">

	import { ThemeToggle, IconButton, Email, X } from "$lib";
    
</script>


<footer class="
    flex flex-row w-full h-fit
    items-center justify-between
    pb-8 sm:pb-16 
">

    <span class=" 
        paragraph text-secondary-fg 
        align-middle select-none
        mr-3
    ">© 2025 Stratus Ventures LLC</span>

    <div class="flex items-center gap-3">
        <ThemeToggle />
        <IconButton 
            icon={Email} 
            href="mailto:jason@stratus-ventures.org" 
            ariaLabel="Send email"
            size={20}
        />
        <IconButton 
            icon={X} 
            href="https://x.com/jasoncoawette" 
            ariaLabel="Follow on X"
            size={20}
        />
    </div>
    
</footer>