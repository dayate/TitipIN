<script lang="ts">
	import { cn } from '$lib/utils';
	import { Plus, Minus } from 'lucide-svelte';
	import type { HTMLInputAttributes } from 'svelte/elements';

	interface Props extends Omit<HTMLInputAttributes, 'value' | 'type'> {
		label?: string;
		error?: string;
		value?: number | string;
		min?: number;
		max?: number;
		step?: number;
	}

	let {
		label,
		error,
		class: className,
		id,
		name,
		value = $bindable(0),
		min = 0,
		max = 999999999,
		step = 1000,
		disabled = false,
		...restProps
	}: Props = $props();

	// Convert value to number for calculations
	let numValue = $derived(typeof value === 'string' ? parseInt(value) || 0 : value || 0);

	function increment() {
		if (disabled) return;
		const newVal = Math.min(numValue + step, max);
		value = newVal;
	}

	function decrement() {
		if (disabled) return;
		const newVal = Math.max(numValue - step, min);
		value = newVal;
	}

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		const parsed = parseInt(target.value) || 0;
		value = Math.max(min, Math.min(parsed, max));
	}
</script>

<div class="space-y-2">
	{#if label}
		<label for={id} class="text-sm font-medium text-foreground">
			{label}
		</label>
	{/if}
	<div class="flex items-center">
		<!-- Hidden input for form submission -->
		{#if name}
			<input type="hidden" {name} value={numValue} />
		{/if}

		<!-- Decrement button -->
		<button
			type="button"
			onclick={decrement}
			{disabled}
			class={cn(
				'flex h-10 w-10 items-center justify-center rounded-l-lg border border-r-0 border-input bg-muted transition-colors',
				'hover:bg-muted/80 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
				'disabled:cursor-not-allowed disabled:opacity-50',
				numValue <= min && 'opacity-40'
			)}
		>
			<Minus class="h-4 w-4" />
		</button>

		<!-- Input field (no spinner) -->
		<input
			{id}
			type="text"
			inputmode="numeric"
			pattern="[0-9]*"
			value={numValue}
			oninput={handleInput}
			{disabled}
			class={cn(
				'h-10 w-full min-w-[80px] border-y border-input bg-background px-3 text-center text-sm font-medium text-foreground',
				'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
				'disabled:cursor-not-allowed disabled:opacity-50',
				'[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
				error && 'border-destructive',
				className
			)}
			{...restProps}
		/>

		<!-- Increment button -->
		<button
			type="button"
			onclick={increment}
			{disabled}
			class={cn(
				'flex h-10 w-10 items-center justify-center rounded-r-lg border border-l-0 border-input bg-muted transition-colors',
				'hover:bg-muted/80 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
				'disabled:cursor-not-allowed disabled:opacity-50',
				numValue >= max && 'opacity-40'
			)}
		>
			<Plus class="h-4 w-4" />
		</button>
	</div>
	{#if error}
		<p class="text-sm text-destructive">{error}</p>
	{/if}
</div>
