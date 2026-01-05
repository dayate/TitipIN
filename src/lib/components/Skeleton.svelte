<script lang="ts">
	/**
	 * Skeleton Loading Component
	 *
	 * Displays a placeholder skeleton while content is loading.
	 * Supports various variants for different content types.
	 *
	 * @example
	 * <Skeleton variant="text" width="100%" />
	 * <Skeleton variant="circle" size={40} />
	 * <Skeleton variant="card" />
	 */

	type SkeletonVariant = 'text' | 'circle' | 'rect' | 'card' | 'avatar' | 'button' | 'input';

	interface Props {
		/** Type of skeleton to display */
		variant?: SkeletonVariant;
		/** Width (for text, rect, button, input) */
		width?: string;
		/** Height (for rect, card, button, input) */
		height?: string;
		/** Size for circle and avatar variants */
		size?: number;
		/** Number of lines for text variant */
		lines?: number;
		/** Additional CSS classes */
		class?: string;
		/** Whether to animate */
		animate?: boolean;
	}

	let {
		variant = 'text',
		width = '100%',
		height = '1rem',
		size = 40,
		lines = 1,
		class: className = '',
		animate = true
	}: Props = $props();

	const baseClasses = 'bg-muted rounded';
	const animateClass = animate ? 'animate-pulse' : '';
</script>

{#if variant === 'text'}
	<div class="flex flex-col gap-2" style="width: {width}">
		{#each Array(lines) as _, i}
			<div
				class="{baseClasses} {animateClass} {className}"
				style="height: {height}; width: {i === lines - 1 && lines > 1 ? '75%' : '100%'}"
				role="status"
				aria-label="Loading..."
			></div>
		{/each}
	</div>
{:else if variant === 'circle'}
	<div
		class="{baseClasses} {animateClass} rounded-full {className}"
		style="width: {size}px; height: {size}px"
		role="status"
		aria-label="Loading..."
	></div>
{:else if variant === 'avatar'}
	<div
		class="{baseClasses} {animateClass} rounded-full {className}"
		style="width: {size}px; height: {size}px"
		role="status"
		aria-label="Loading..."
	></div>
{:else if variant === 'rect'}
	<div
		class="{baseClasses} {animateClass} {className}"
		style="width: {width}; height: {height}"
		role="status"
		aria-label="Loading..."
	></div>
{:else if variant === 'button'}
	<div
		class="{baseClasses} {animateClass} rounded-md {className}"
		style="width: {width}; height: {height || '2.5rem'}"
		role="status"
		aria-label="Loading..."
	></div>
{:else if variant === 'input'}
	<div
		class="{baseClasses} {animateClass} rounded-md {className}"
		style="width: {width}; height: {height || '2.5rem'}"
		role="status"
		aria-label="Loading..."
	></div>
{:else if variant === 'card'}
	<div class="flex flex-col gap-3 p-4 border rounded-lg {className}">
		<div class="flex items-center gap-3">
			<div
				class="{baseClasses} {animateClass} rounded-full"
				style="width: 40px; height: 40px"
			></div>
			<div class="flex-1 flex flex-col gap-2">
				<div class="{baseClasses} {animateClass}" style="height: 0.875rem; width: 60%"></div>
				<div class="{baseClasses} {animateClass}" style="height: 0.75rem; width: 40%"></div>
			</div>
		</div>
		<div class="flex flex-col gap-2">
			<div class="{baseClasses} {animateClass}" style="height: 0.875rem; width: 100%"></div>
			<div class="{baseClasses} {animateClass}" style="height: 0.875rem; width: 90%"></div>
			<div class="{baseClasses} {animateClass}" style="height: 0.875rem; width: 75%"></div>
		</div>
	</div>
{/if}
