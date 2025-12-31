<script lang="ts">
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes, HTMLAnchorAttributes } from 'svelte/elements';

	type BaseProps = {
		variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
		size?: 'default' | 'sm' | 'lg' | 'icon';
		children?: Snippet;
		class?: string;
	};

	type ButtonProps = BaseProps & HTMLButtonAttributes & { href?: never };
	type AnchorProps = BaseProps & HTMLAnchorAttributes & { href: string };

	type Props = ButtonProps | AnchorProps;

	let {
		variant = 'default',
		size = 'default',
		href,
		class: className,
		children,
		...restProps
	}: Props = $props();

	const baseStyles =
		'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';

	const variants: Record<string, string> = {
		default: 'bg-primary text-primary-foreground hover:opacity-90',
		destructive: 'bg-destructive text-destructive-foreground hover:opacity-90',
		outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
		secondary: 'bg-secondary text-secondary-foreground hover:opacity-80',
		ghost: 'hover:bg-accent hover:text-accent-foreground',
		link: 'text-primary underline-offset-4 hover:underline'
	};

	const sizes: Record<string, string> = {
		default: 'h-10 px-4 py-2',
		sm: 'h-9 rounded-md px-3',
		lg: 'h-11 rounded-lg px-8',
		icon: 'h-10 w-10'
	};

	let combinedClass = $derived(cn(baseStyles, variants[variant], sizes[size], className));
</script>

{#if href}
	<a {href} class={combinedClass} {...restProps}>
		{#if children}
			{@render children()}
		{/if}
	</a>
{:else}
	<button class={combinedClass} {...restProps}>
		{#if children}
			{@render children()}
		{/if}
	</button>
{/if}
