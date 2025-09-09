<script>
	/**
	 * @typedef {Object} Props
	 * @property {string} [color]
	 * @property {number} [size]
	 * @property {boolean} [isHovered]
	 * @property {string} [class]
	 */

	/** @type {Props} */
	let {
		color = 'currentColor',
		size = 24,
		isHovered = false,
		class: className = ''
	} = $props();

	function handleMouseEnter() {
		if (isHovered) return;
		isHovered = true;

		setTimeout(() => {
			isHovered = false;
		}, 800);
	}
</script>

<div class={className} aria-label="X (Twitter)" role="img" onmouseenter={handleMouseEnter}>
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width={size}
		height={size}
		viewBox="0 0 1200 1227"
		fill="none"
		class="x-icon"
		class:animate={isHovered}
	>
		<path 
			d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6944H306.615L611.412 515.685L658.88 583.579L1055.08 1150.3H892.476L569.165 687.854V687.828Z" 
			fill={color}
			class="x-path"
		/>
	</svg>
</div>

<style>
	div {
		display: inline-block;
	}
	
	.x-icon {
		overflow: visible;
	}
	
	.x-icon:hover {
		transform: rotate(25deg);
	}
	
	
	.x-icon.animate {
		animation: xAnimation 0.3s ease;
	}
	
	@keyframes xAnimation {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(25deg);
		}
	}
</style>
