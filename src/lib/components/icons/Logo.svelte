<script lang="ts">
	/**
	 * @typedef {Object} Props
	 * @property {string} [color]
	 * @property {number} [size]
	 * @property {string} [class]
	 */

	/** @type {Props} */
	let {
		color = 'var(--color-primary-fg)',
		size = 64,
	} = $props();
</script>

<svg 
    width={size}
    height={size}
    viewBox="0 0 24 24" 
    fill="none"
    stroke={color}
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    xmlns="http://www.w3.org/2000/svg"
>
    <path d="M16,8 C15,4 14,2 12,2 C9,2 7,6 7,12 S9,22 12,22 C12,22 13,22 13,22" />
    <path d="M15,14 L19,16 L17,20" />
    <path d="M19,16 C17,17 15,17 12,17 C7,17 2,15 2,12 S7,7 12,7 C17,7 21,9 22,11" />
</svg>
    
