<script lang="ts">
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';

	interface Props {
		class?: string;
		children?: Snippet;
	}

	let { class: className, children }: Props = $props();
</script>

<div class={cn('rounded-xl border border-border bg-card p-6 shadow-sm', className)}>
	{#if children}
		{@render children()}
	{/if}
</div>
