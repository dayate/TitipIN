<script lang="ts">
	import { onMount } from 'svelte';

	interface Props {
		text: string;
		position?: 'top' | 'bottom' | 'left' | 'right';
		delay?: number;
		children: import('svelte').Snippet;
	}

	let { text, position = 'top', delay = 300, children }: Props = $props();

	let visible = $state(false);
	let hovered = $state(false);
	let timeoutId: ReturnType<typeof setTimeout> | null = null;
	let container: HTMLElement | null = null;

	function handleMouseEnter() {
		hovered = true;
		timeoutId = setTimeout(() => {
			if (hovered) visible = true;
		}, delay);
	}

	function handleMouseLeave() {
		hovered = false;
		if (timeoutId) {
			clearTimeout(timeoutId);
			timeoutId = null;
		}
		visible = false;
	}

	const positionClasses: Record<string, string> = {
		top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
		bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
		left: 'right-full top-1/2 -translate-y-1/2 mr-2',
		right: 'left-full top-1/2 -translate-y-1/2 ml-2'
	};

	const arrowClasses: Record<string, string> = {
		top: 'top-full left-1/2 -translate-x-1/2 border-t-foreground border-x-transparent border-b-transparent',
		bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-foreground border-x-transparent border-t-transparent',
		left: 'left-full top-1/2 -translate-y-1/2 border-l-foreground border-y-transparent border-r-transparent',
		right: 'right-full top-1/2 -translate-y-1/2 border-r-foreground border-y-transparent border-l-transparent'
	};
</script>

<div
	class="relative inline-flex"
	bind:this={container}
	onmouseenter={handleMouseEnter}
	onmouseleave={handleMouseLeave}
	onfocus={handleMouseEnter}
	onblur={handleMouseLeave}
	role="tooltip"
>
	{@render children()}

	{#if visible && text}
		<div
			class="pointer-events-none absolute z-50 whitespace-nowrap rounded-lg bg-foreground px-2.5 py-1.5 text-xs font-medium text-background shadow-lg animate-in fade-in-0 zoom-in-95 duration-150 {positionClasses[position]}"
		>
			{text}
			<div class="absolute border-4 {arrowClasses[position]}"></div>
		</div>
	{/if}
</div>
