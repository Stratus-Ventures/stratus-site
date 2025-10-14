<script lang="ts">
	import { ThemeToggle, IconButton, Email, X } from '$lib';
</script>

<footer
	class="
    flex h-fit w-full flex-row
    items-center justify-between
    pb-8 sm:pb-16
"
>
	<span
		class=" 
        small mr-3
        align-middle text-secondary-fg
        select-none
    ">© 2025 Stratus Ventures LLC</span
	>

	<div class="flex items-center gap-3">
		<ThemeToggle />
		<IconButton
			icon={Email}
			href="mailto:jason@stratus-ventures.org"
			ariaLabel="Send email"
			size={18}
		/>
		<IconButton icon={X} href="https://x.com/jasoncoawette" ariaLabel="Follow on X" size={18} />
	</div>
</footer>
