<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	// Initialize theme store
	import '$lib/stores/themeStore';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children?.()}
