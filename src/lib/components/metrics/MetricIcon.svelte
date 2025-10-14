<script lang="ts">
	import { Users, Downloads, Subscriptions, APIIcon } from '$lib';

	interface Props {
		iconType: string;
		color?: string;
		size?: number;
		isHovered?: boolean;
		class?: string;
	}

	let {
		iconType,
		color = 'var(--color-secondary-fg)',
		size = 18,
		isHovered = false,
		class: className = 'p-1'
	}: Props = $props();

	const iconMap = {
		users: Users,
		downloads: Downloads,
		subscriptions: Subscriptions,
		'api calls': APIIcon
	};

	let IconComponent = $derived(iconMap[iconType.toLowerCase() as keyof typeof iconMap] || Users);
</script>

<IconComponent {color} {size} {isHovered} class={className} />
