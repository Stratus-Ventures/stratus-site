<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import banner from '$lib/assets/banner.png';
	import appleIcon from '$lib/assets/apple-icon.png';
	import '$lib/stores/themeStore';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link rel="apple-touch-icon" href={appleIcon} />
	
	<!-- OpenGraph Meta Tags -->
	<meta property="og:title" content="Stratus" />
	<meta property="og:description" content="Stratus Ventures - Stratus Ventures LLC owns a group of AI-forward ventures founded by Jason Coawette and is located in Phoenix Arizona." />
	<meta property="og:image" content={banner} />
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://stratus-ventures.org" />
	
	<!-- Twitter Card Meta Tags -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="Stratus" />
	<meta name="twitter:description" content="Stratus Ventures - Stratus Ventures LLC owns a group of AI-forward ventures founded by Jason Coawette and is located in Phoenix Arizona." />
	<meta name="twitter:image" content={banner} />
</svelte:head>

{@render children?.()}
