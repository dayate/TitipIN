<script lang="ts">
	/**
	 * Loading States Component
	 *
	 * Provides consistent loading skeletons for common page layouts.
	 * Uses the base Skeleton component internally.
	 *
	 * @example
	 * <LoadingStates variant="page" />
	 * <LoadingStates variant="table" rows={5} />
	 * <LoadingStates variant="cards" count={4} />
	 */

	import Skeleton from './Skeleton.svelte';

	type LoadingVariant = 'page' | 'table' | 'cards' | 'form' | 'list' | 'dashboard' | 'profile';

	interface Props {
		/** Type of loading state to display */
		variant?: LoadingVariant;
		/** Number of rows for table variant */
		rows?: number;
		/** Number of cards for cards variant */
		count?: number;
		/** Number of columns for table */
		columns?: number;
		/** Additional CSS classes */
		class?: string;
	}

	let {
		variant = 'page',
		rows = 5,
		count = 4,
		columns = 4,
		class: className = ''
	}: Props = $props();
</script>

{#if variant === 'page'}
	<!-- Full page loading skeleton -->
	<div class="flex flex-col gap-6 {className}">
		<!-- Header -->
		<div class="flex items-center justify-between">
			<Skeleton variant="text" width="200px" height="2rem" />
			<Skeleton variant="button" width="120px" />
		</div>

		<!-- Content area -->
		<div class="grid gap-4 md:grid-cols-3">
			{#each Array(3) as _}
				<Skeleton variant="card" />
			{/each}
		</div>

		<!-- Main content -->
		<div class="rounded-lg border p-6">
			<Skeleton variant="text" lines={4} />
		</div>
	</div>
{:else if variant === 'table'}
	<!-- Table loading skeleton -->
	<div class="rounded-lg border overflow-hidden {className}">
		<!-- Table header -->
		<div class="flex gap-4 p-4 bg-muted/50 border-b">
			{#each Array(columns) as _}
				<Skeleton variant="text" width="100px" height="0.875rem" />
			{/each}
		</div>

		<!-- Table rows -->
		{#each Array(rows) as _}
			<div class="flex gap-4 p-4 border-b last:border-0">
				{#each Array(columns) as _, i}
					<Skeleton variant="text" width={i === 0 ? '150px' : '80px'} height="0.875rem" />
				{/each}
			</div>
		{/each}
	</div>
{:else if variant === 'cards'}
	<!-- Cards grid loading skeleton -->
	<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 {className}">
		{#each Array(count) as _}
			<Skeleton variant="card" />
		{/each}
	</div>
{:else if variant === 'form'}
	<!-- Form loading skeleton -->
	<div class="flex flex-col gap-6 max-w-md {className}">
		{#each Array(4) as _}
			<div class="flex flex-col gap-2">
				<Skeleton variant="text" width="100px" height="0.875rem" />
				<Skeleton variant="input" />
			</div>
		{/each}
		<div class="flex gap-3 mt-4">
			<Skeleton variant="button" width="100px" />
			<Skeleton variant="button" width="80px" />
		</div>
	</div>
{:else if variant === 'list'}
	<!-- List loading skeleton -->
	<div class="flex flex-col gap-3 {className}">
		{#each Array(rows) as _}
			<div class="flex items-center gap-3 p-3 border rounded-lg">
				<Skeleton variant="avatar" size={40} />
				<div class="flex-1 flex flex-col gap-2">
					<Skeleton variant="text" width="60%" height="0.875rem" />
					<Skeleton variant="text" width="40%" height="0.75rem" />
				</div>
				<Skeleton variant="button" width="60px" height="2rem" />
			</div>
		{/each}
	</div>
{:else if variant === 'dashboard'}
	<!-- Dashboard loading skeleton -->
	<div class="flex flex-col gap-6 {className}">
		<!-- Stats row -->
		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
			{#each Array(4) as _}
				<div class="p-4 border rounded-lg">
					<Skeleton variant="text" width="80px" height="0.75rem" />
					<Skeleton variant="text" width="120px" height="2rem" class="mt-2" />
					<Skeleton variant="text" width="100px" height="0.75rem" class="mt-2" />
				</div>
			{/each}
		</div>

		<!-- Chart and table -->
		<div class="grid gap-6 lg:grid-cols-2">
			<div class="p-4 border rounded-lg">
				<Skeleton variant="text" width="150px" height="1.25rem" />
				<Skeleton variant="rect" width="100%" height="200px" class="mt-4" />
			</div>
			<div class="p-4 border rounded-lg">
				<Skeleton variant="text" width="150px" height="1.25rem" />
				<div class="mt-4 flex flex-col gap-3">
					{#each Array(5) as _}
						<div class="flex justify-between">
							<Skeleton variant="text" width="120px" />
							<Skeleton variant="text" width="60px" />
						</div>
					{/each}
				</div>
			</div>
		</div>
	</div>
{:else if variant === 'profile'}
	<!-- Profile page loading skeleton -->
	<div class="flex flex-col gap-6 {className}">
		<!-- Header -->
		<div class="flex items-center gap-4">
			<Skeleton variant="avatar" size={80} />
			<div class="flex flex-col gap-2">
				<Skeleton variant="text" width="200px" height="1.5rem" />
				<Skeleton variant="text" width="150px" height="0.875rem" />
				<Skeleton variant="text" width="100px" height="0.75rem" />
			</div>
		</div>

		<!-- Content sections -->
		<div class="grid gap-4 md:grid-cols-2">
			{#each Array(2) as _}
				<div class="p-4 border rounded-lg">
					<Skeleton variant="text" width="120px" height="1rem" class="mb-4" />
					<Skeleton variant="text" lines={3} />
				</div>
			{/each}
		</div>
	</div>
{/if}
