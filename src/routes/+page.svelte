<script lang="ts">

    import { Button, Footer, Logo } from '$lib';

</script>


<div class="
    flex flex-col w-full min-w-xs h-fit sm:h-screen
    items-center justify-center
    p-5 sm:p-8 antialiased
">

    <!-- MAIN -->
     <main class="
        flex flex-col w-full max-w-7xl h-fit
        items-center justify-start
     ">

        <!-- HERO SECTION -->
        <section class="
            flex flex-row w-full h-fit
            items-center justify-start
        ">

            <!-- CONTENT CONTAINER -->
            <div class="
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
                <p class="paragraph text-secondary-fg line-clamp-3 h-fit">
                    Stratus Ventures LLC owns a group of AI-forward ventures founded by
                    <a href="https://x.com/jasoncoawette" class="text-primary-fg title link-text">Jason Coawette</a>
                    and is located in Phoenix, Arizona.
                </p>

                <!-- BUTTON WRAPPER -->
                <div class="
                    flex flex-col sm:flex-row w-full sm:w-fit h-fit 
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

                <!-- 3D GLOBE -->

                <!-- METRICS BLOCK -->

        </section>

        <!-- PRODUCT LIST -->
        <div class="
            flex flex-row w-full h-fit
            items-center justify-center
        ">
            
        </div>

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