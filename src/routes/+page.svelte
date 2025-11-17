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
		// [ STEP 1.] - Handle successful authentication
		if (data.auth?.isAuthenticated) {
			completeAuthFlow();
		}
		// [ STEP 2.] - Handle authentication errors
		else if (data.auth?.error) {
			// [ STEP 3.] - Manage auth flow completion
			clearAuthState();
		}
	});
</script>

<div
	class="
    theme-transition flex h-fit w-full min-w-xs flex-col
    items-center justify-start
    px-5 pb-5 pt-5 antialiased xl:h-screen sm:px-16 sm:pb-16 lg:pt-16 overflow-x-hidden
	"
>
	<!-- MAIN -->
	<main
		class="
        flex h-fit w-full max-w-5xl
        flex-col items-center
        justify-start gap-16
     "
	>
		<!-- HERO SECTION -->
		<section	
			class="
            flex h-fit w-full flex-col items-center justify-center
            lg:justify-between lg:flex-row gap-5 lg:pl-14
        "
		>
			<!-- CONTENT CONTAINER -->
			<div
				class="
                order-2 flex
                h-fit w-full flex-col items-start
                justify-center gap-5
                lg:order-1
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
				<p class="paragraph line-clamp-4 w-full max-w-120 min-w-80 sm:w-fit text-secondary-fg select-none">
					Stratus Ventures LLC owns a group of AI-forward ventures founded by
					<a href="https://jasoncoawette.com" class="title link-text text-primary-fg"
						>Jason Coawette</a>
					and is located in Phoenix, Arizona.
				</p>

				<!-- BUTTON WRAPPER -->
				<div
					class="
									mt-5 flex h-fit w-full flex-row
									items-center justify-center lg:justify-start
									gap-3
                "
				>
					<Button
						href="https://cal.com/jason-coawette/1-1-video-consultation?overlayCalendar=true"
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
					h-fit w-full flex-col items-center lg:items-end
					justify-center lg:order-2
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
