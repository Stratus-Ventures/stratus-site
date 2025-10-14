<script lang="ts">
	import { Button, Footer, Logo, ProductList, MetricsBlock, Globe } from '$lib';
	import type { PageData } from './$types';
	import { completeAuthFlow, clearAuthState } from '$lib';
	import { onMount } from 'svelte';

	let { data }: { data: PageData } = $props();

	// 1. Handle successful authentication
	// 2. Handle authentication errors
	// 3. Manage auth flow completion

	// ------------------------------------------------------------------- //

	onMount(() => {
		// [ STEP 1. ] - Handle successful authentication
		if (data.auth?.isAuthenticated) {
			completeAuthFlow();
		}
		// [ STEP 2. ] - Handle authentication errors
		else if (data.auth?.error) {
			// [ STEP 3. ] - Manage auth flow completion
			clearAuthState();
		}
	});
</script>

<div
	class="
    theme-transition flex h-fit w-full min-w-xs flex-col
    items-center justify-start
    p-5 antialiased sm:h-screen sm:p-8
	"
>
	<!-- MAIN -->
	<main
		class="
        flex h-fit w-full max-w-6xl
        flex-col items-center
        justify-start gap-16 sm:mt-8
     "
	>
		<!-- HERO SECTION -->
		<section
			class="
            flex h-fit w-full flex-col items-center
            justify-start gap-5 md:flex-row sm:gap-8
        "
		>
			<!-- CONTENT CONTAINER -->
			<div
				class="
                order-2 flex
                h-fit w-full flex-col items-start
                justify-center gap-5
                sm:order-1
            "
			>
				<!-- LOGO & H1 -->
				<div
					class="
                    flex h-fit w-fit flex-row
                    items-center justify-center
                    gap-3
                "
				>
					<Logo size={60} />
					<h1 class="h1 text-primary-fg select-none">Stratus</h1>
				</div>

				<!-- PARAGRAPH -->
				<p class="paragraph line-clamp-4 w-fit text-secondary-fg select-none">
					Stratus Ventures LLC owns a group of AI-forward ventures founded by
					<a href="https://x.com/jasoncoawette" class="title link-text text-primary-fg"
						>Jason Coawette</a
					>
					and is located in Phoenix, Arizona.
				</p>

				<!-- BUTTON WRAPPER -->
				<div
					class="
                    mt-5 flex h-fit w-full flex-row
                    items-center justify-center
                    gap-3 sm:w-fit
                "
				>
					<Button
						href="https://cal.com/stratus-ventures.org/coffee-chat"
						label="Book a Call"
						shimmer={true}
					/>
					<Button href="mailto:jason@stratus-ventures.org" label="E-Mail" variant="outlined" />
				</div>
			</div>

			<!-- HERO GRAPHIC CONTAINER -->
			<div
				class="
                order-1 flex
                h-fit w-full flex-col items-center
                justify-center sm:order-2 gap-0
            "
			>
				<!-- 3D GLOBE -->
				<Globe />
				<!-- METRICS BLOCK -->
				<MetricsBlock metrics={data.metrics} />
			</div>
		</section>

		<!-- PRODUCT LIST -->
		<ProductList
			products={data.products}
			error={data.error}
			isAuthenticated={data.auth?.isAuthenticated || false}
		/>

		<!-- FOOTER -->
		<Footer />
	</main>
</div>

<style>
	/* LINK STYLES */
	.link-text {
		position: relative;
		display: inline-block;
		text-decoration: none;
	}

	.link-text::after {
		content: '';
		position: absolute;
		left: 0;
		bottom: 0;
		height: 1px;
		width: 100%;
		background-color: currentColor;
		transform: scaleX(0);
		transform-origin: left;
		transition: transform 300ms ease-in-out;
	}

	.link-text:hover::after {
		transform: scaleX(1);
	}
</style>
