<script>
	/**
	 * @typedef {Object} Props
	 * @property {string} [color]
	 * @property {number} [size]
	 * @property {number} [strokeWidth]
	 * @property {boolean} [isHovered]
	 * @property {string} [class]
	 */

	/** @type {Props} */
	let {
		color = 'currentColor',
		size = 24,
		strokeWidth = 2,
		isHovered = false,
		class: className = ''
	} = $props();

	function handleMouseEnter() {
		isHovered = true;
	}
</script>

<div class={className} onmouseenter={handleMouseEnter} aria-label="cloud-download" role="img">
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		stroke={color}
		stroke-width={strokeWidth}
		stroke-linecap="round"
		stroke-linejoin="round"
	>
		<g class:animate={isHovered}>
			<path d="M12 13v8l-4-4" />
			<path d="m12 21 4-4" />
		</g>
		<path d="M4.393 15.269A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.436 8.284" />
	</svg>
</div>

<style>
	div {
		display: inline-block;
	}
	g.animate path {
		transform: translateY(2px);
		transition: transform 450ms cubic-bezier(0.34, 1.56, 0.64, 1);
	}
	g path {
		transform: translateY(0);
		transition: transform 450ms cubic-bezier(0.34, 1.56, 0.64, 1);
	}
</style>
