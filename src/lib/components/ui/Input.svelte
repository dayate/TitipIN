<script lang="ts">
	import { cn } from '$lib/utils';
	import { Eye, EyeOff } from 'lucide-svelte';
	import type { HTMLInputAttributes } from 'svelte/elements';

	interface Props extends Omit<HTMLInputAttributes, 'value'> {
		label?: string;
		error?: string;
		value?: string;
		showPasswordToggle?: boolean;
	}

	let {
		label,
		error,
		class: className,
		id,
		type = 'text',
		value = $bindable(''),
		showPasswordToggle = false,
		...restProps
	}: Props = $props();

	let showPassword = $state(false);
	let inputType = $derived(showPasswordToggle && showPassword ? 'text' : type);
</script>

<div class="space-y-2">
	{#if label}
		<label for={id} class="text-sm font-medium text-foreground">
			{label}
		</label>
	{/if}
	<div class="relative">
		<input
			{id}
			type={inputType}
			bind:value
			class={cn(
				'flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
				error && 'border-destructive',
				showPasswordToggle && 'pr-10',
				className
			)}
			{...restProps}
		/>
		{#if showPasswordToggle}
			<button
				type="button"
				onclick={() => (showPassword = !showPassword)}
				class="absolute right-0 top-0 flex h-10 w-10 items-center justify-center text-muted-foreground hover:text-foreground"
				tabindex={-1}
			>
				{#if showPassword}
					<EyeOff class="h-4 w-4" />
				{:else}
					<Eye class="h-4 w-4" />
				{/if}
			</button>
		{/if}
	</div>
	{#if error}
		<p class="text-sm text-destructive">{error}</p>
	{/if}
</div>
