<script lang="ts">
    
    import { Button, Footer, Logo, ProductList } from '$lib';
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


<div class="
    flex flex-col w-full min-w-xs h-fit sm:h-screen
    items-center justify-start
    p-5 sm:p-8 antialiased theme-transition
">

    <!-- MAIN -->
     <main class="
        flex flex-col w-full max-w-6xl h-fit
        items-center justify-start 
        gap-24 mt-24
     ">

        <!-- HERO SECTION -->
        <section class="
            flex flex-col sm:flex-row w-full h-fit
            items-center justify-start
        ">

            <!-- CONTENT CONTAINER -->
            <div class="
                order-2 sm:order-1
                flex flex-col w-full h-fit
                items-start justify-center
                gap-5
            ">
                <!-- LOGO & H1 -->
                <div class="
                    flex flex-row w-fit h-fit
                    items-center justify-center
                    gap-3
                ">
                    <Logo 
                        size={64}
                    />
                    <h1 class="h1 text-primary-fg select-none">Stratus</h1>
                </div>

                <!-- PARAGRAPH -->
                <p class="paragraph text-secondary-fg line-clamp-4 w-fit select-none">
                    Stratus Ventures LLC owns a group of AI-forward ventures founded by
                    <a href="https://x.com/jasoncoawette" class="text-primary-fg title link-text">Jason Coawette</a>
                    and is located in Phoenix, Arizona.
                </p>

                <!-- BUTTON WRAPPER -->
                <div class="
                    flex flex-row w-full sm:w-fit h-fit 
                    items-center justify-center 
                    gap-3 mt-5
                ">
                    <Button 
                        href="https://cal.com/stratus-ventures.org/coffee-chat" 
                        label="Book a Call" 
                        shimmer={true} 
                    />
                    <Button 
                        href="mailto:jason@stratus-ventures.org" 
                        label="E-Mail" 
                        variant="outlined"
                    />
                </div>
            </div>
            

            <!-- HERO GRAPHIC CONTAINER -->
            <div class="
                order-1 sm:order-2
                flex flex-col w-full h-fit
                items-center justify-center
            ">

                <!-- 3D GLOBE -->

                <!-- METRICS BLOCK -->

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
