<script lang="ts">
	import { Loader2 } from 'lucide-svelte';

	interface Props {
		size?: 'sm' | 'md' | 'lg';
		text?: string;
		class?: string;
	}

	let { size = 'md', text = '', class: className = '' }: Props = $props();

	const sizeClasses = {
		sm: 'h-4 w-4',
		md: 'h-6 w-6',
		lg: 'h-8 w-8'
	};
</script>

<div class="flex items-center justify-center gap-2 {className}">
	<Loader2 class="{sizeClasses[size]} animate-spin text-primary" />
	{#if text}
		<span class="text-sm text-muted-foreground">{text}</span>
	{/if}
</div>
