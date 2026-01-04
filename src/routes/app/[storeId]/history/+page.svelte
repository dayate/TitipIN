<script lang="ts">
	import { Card, Button } from '$lib/components/ui';
	import { enhance } from '$app/forms';
	import { goto, invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';
	import {
		ArrowLeft,
		CalendarDays,
		Clock,
		CheckCircle2,
		FileText,
		ImageOff,
		Filter,
		Download,
		Trash2,
		X,
		AlertCircle
	} from 'lucide-svelte';

	let { data, form } = $props();

	// Filter states
	let statusFilter = $state(data.filters?.status || '');
	let startDate = $state(data.filters?.startDate || '');
	let endDate = $state(data.filters?.endDate || '');
	let showFilters = $state(false);

	// Selection states for delete
	let selectedIds = $state<Set<number>>(new Set());
	let showDeleteConfirm = $state(false);
	let deleteLoading = $state(false);

	function getStatusBadge(status: string) {
		switch (status) {
			case 'completed':
				return {
					class: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
					label: 'Selesai',
					Icon: CheckCircle2
				};
			case 'verified':
				return {
					class: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
					label: 'Divalidasi',
					Icon: CheckCircle2
				};
			default:
				return {
					class: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
					label: 'Draft',
					Icon: Clock
				};
		}
	}

	function formatDate(dateString: string) {
		const date = new Date(dateString);
		return date.toLocaleDateString('id-ID', {
			weekday: 'short',
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}

	function formatCurrency(value: number) {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0
		}).format(value);
	}

	// Calculate stats
	let stats = $derived(() => {
		const total = data.transactions.length;
		const draft = data.transactions.filter((t: any) => t.status === 'draft').length;
		const verified = data.transactions.filter((t: any) => t.status === 'verified').length;
		const completed = data.transactions.filter((t: any) => t.status === 'completed').length;
		const totalPayout = data.transactions
			.filter((t: any) => t.status === 'completed')
			.reduce((sum: number, t: any) => sum + t.totalPayout, 0);
		return { total, draft, verified, completed, totalPayout };
	});

	function applyFilters() {
		const params = new URLSearchParams();
		if (statusFilter) params.set('status', statusFilter);
		if (startDate) params.set('startDate', startDate);
		if (endDate) params.set('endDate', endDate);
		goto(`?${params.toString()}`, { invalidateAll: true });
	}

	function clearFilters() {
		statusFilter = '';
		startDate = '';
		endDate = '';
		goto('?', { invalidateAll: true });
	}

	function toggleSelectAll() {
		if (selectedIds.size === data.transactions.length) {
			selectedIds = new Set();
		} else {
			selectedIds = new Set(data.transactions.map((t: any) => t.id));
		}
	}

	function toggleSelect(id: number) {
		if (selectedIds.has(id)) {
			selectedIds.delete(id);
			selectedIds = new Set(selectedIds);
		} else {
			selectedIds.add(id);
			selectedIds = new Set(selectedIds);
		}
	}

	let exportUrl = $derived(() => {
		const params = new URLSearchParams();
		if (statusFilter) params.set('status', statusFilter);
		if (startDate) params.set('startDate', startDate);
		if (endDate) params.set('endDate', endDate);
		const query = params.toString();
		return `/app/${data.store.id}/history/export${query ? '?' + query : ''}`;
	});

	let hasFilters = $derived(statusFilter || startDate || endDate);
</script>

<svelte:head>
	<title>Riwayat Setoran - {data.store.name} - Mak Unyil</title>
</svelte:head>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<div>
			<a
				href="/app/{data.store.id}"
				class="mb-2 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
			>
				<ArrowLeft class="h-4 w-4" />
				Kembali ke Lapak
			</a>
			<h1 class="text-2xl font-bold text-foreground">Riwayat Setoran</h1>
			<p class="text-muted-foreground">{data.store.name}</p>
		</div>
		<div class="flex items-center gap-2">
			<Button onclick={() => showFilters = !showFilters} variant="outline" class="gap-2">
				<Filter class="h-4 w-4" />
				Filter
				{#if hasFilters}
					<span class="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">!</span>
				{/if}
			</Button>
			<Button href={exportUrl()} variant="outline" class="gap-2" disabled={data.transactions.length === 0}>
				<Download class="h-4 w-4" />
				Export CSV
			</Button>
			{#if selectedIds.size > 0}
				<Button onclick={() => showDeleteConfirm = true} variant="destructive" class="gap-2">
					<Trash2 class="h-4 w-4" />
					Hapus ({selectedIds.size})
				</Button>
			{/if}
		</div>
	</div>

	<!-- Filters Panel -->
	{#if showFilters}
		<Card class="border-primary/20">
			<div class="space-y-4">
				<div class="flex items-center justify-between">
					<h3 class="font-semibold text-foreground">Filter Riwayat</h3>
					<button onclick={() => showFilters = false} class="rounded-lg p-1 hover:bg-muted">
						<X class="h-4 w-4" />
					</button>
				</div>
				<div class="grid gap-4 sm:grid-cols-3">
					<div class="space-y-2">
						<label for="statusFilter" class="text-sm font-medium text-foreground">Status</label>
						<select
							id="statusFilter"
							bind:value={statusFilter}
							class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
						>
							<option value="">Semua Status</option>
							<option value="draft">Draft</option>
							<option value="verified">Divalidasi</option>
							<option value="completed">Selesai</option>
						</select>
					</div>
					<div class="space-y-2">
						<label for="startDate" class="text-sm font-medium text-foreground">Dari Tanggal</label>
						<input
							id="startDate"
							type="date"
							bind:value={startDate}
							class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
						/>
					</div>
					<div class="space-y-2">
						<label for="endDate" class="text-sm font-medium text-foreground">Sampai Tanggal</label>
						<input
							id="endDate"
							type="date"
							bind:value={endDate}
							class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
						/>
					</div>
				</div>
				<div class="flex gap-2">
					<Button onclick={applyFilters} class="gap-2">
						<Filter class="h-4 w-4" />
						Terapkan Filter
					</Button>
					{#if hasFilters}
						<Button onclick={clearFilters} variant="outline">Hapus Filter</Button>
					{/if}
				</div>
			</div>
		</Card>
	{/if}

	<!-- Stats -->
	<div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
		<Card class="text-center">
			<p class="text-2xl font-bold text-foreground">{stats().total}</p>
			<p class="text-sm text-muted-foreground">Total</p>
		</Card>
		<Card class="text-center">
			<p class="text-2xl font-bold text-yellow-600">{stats().draft}</p>
			<p class="text-sm text-muted-foreground">Draft</p>
		</Card>
		<Card class="text-center">
			<p class="text-2xl font-bold text-blue-600">{stats().verified}</p>
			<p class="text-sm text-muted-foreground">Divalidasi</p>
		</Card>
		<Card class="text-center">
			<p class="text-2xl font-bold text-green-600">{stats().completed}</p>
			<p class="text-sm text-muted-foreground">Selesai</p>
		</Card>
	</div>

	<!-- Total Earnings Card -->
	{#if stats().totalPayout > 0}
		<Card class="border-primary/20 bg-primary/5">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-sm text-muted-foreground">Total Pendapatan</p>
					<p class="text-2xl font-bold text-primary">{formatCurrency(stats().totalPayout)}</p>
				</div>
				<div class="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
					<CheckCircle2 class="h-6 w-6 text-primary" />
				</div>
			</div>
		</Card>
	{/if}

	<!-- Transactions Table -->
	{#if data.transactions.length === 0}
		<Card class="py-12 text-center">
			<div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
				<FileText class="h-8 w-8 text-muted-foreground" />
			</div>
			<h2 class="text-lg font-semibold text-foreground">
				{hasFilters ? 'Tidak ada hasil' : 'Belum ada riwayat'}
			</h2>
			<p class="mt-2 text-muted-foreground">
				{hasFilters ? 'Coba ubah filter untuk melihat data lain' : 'Riwayat setoran Anda akan muncul di sini'}
			</p>
			{#if hasFilters}
				<Button onclick={clearFilters} class="mt-4" variant="outline">Hapus Filter</Button>
			{:else}
				<Button href="/app/{data.store.id}/setor" class="mt-4">
					Input Setoran
				</Button>
			{/if}
		</Card>
	{:else}
		<Card class="overflow-hidden p-0">
			<div class="overflow-x-auto">
				<table class="w-full text-sm">
					<thead class="border-b border-border bg-muted/50">
						<tr>
							<th class="whitespace-nowrap px-4 py-3 text-left">
								<input
									type="checkbox"
									checked={selectedIds.size === data.transactions.length}
									onchange={toggleSelectAll}
									class="h-4 w-4 rounded border-input"
								/>
							</th>
							<th class="whitespace-nowrap px-4 py-3 text-left font-medium text-muted-foreground">Tanggal</th>
							<th class="whitespace-nowrap px-4 py-3 text-left font-medium text-muted-foreground">Produk</th>
							<th class="whitespace-nowrap px-4 py-3 text-center font-medium text-muted-foreground">Masuk</th>
							<th class="whitespace-nowrap px-4 py-3 text-center font-medium text-muted-foreground">Terjual</th>
							<th class="whitespace-nowrap px-4 py-3 text-center font-medium text-muted-foreground">Retur</th>
							<th class="whitespace-nowrap px-4 py-3 text-right font-medium text-muted-foreground">Keuntungan</th>
							<th class="whitespace-nowrap px-4 py-3 text-center font-medium text-muted-foreground">Status</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-border">
						{#each data.transactions as trx}
							{@const status = getStatusBadge(trx.status)}
							{#if trx.items.length === 0}
								<tr class="hover:bg-muted/30">
									<td class="whitespace-nowrap px-4 py-3">
										<input
											type="checkbox"
											checked={selectedIds.has(trx.id)}
											onchange={() => toggleSelect(trx.id)}
											class="h-4 w-4 rounded border-input"
										/>
									</td>
									<td class="whitespace-nowrap px-4 py-3">
										<div class="flex items-center gap-2">
											<CalendarDays class="h-4 w-4 text-muted-foreground" />
											<span class="font-medium">{formatDate(trx.date)}</span>
										</div>
									</td>
									<td class="px-4 py-3 text-muted-foreground" colspan="5">Tidak ada item</td>
									<td class="px-4 py-3 text-center">
										<span class="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium {status.class}">
											<status.Icon class="h-3 w-3" />
											{status.label}
										</span>
									</td>
								</tr>
							{:else}
								{#each trx.items as { item, product }, idx}
									{@const qtySold = item.qtyActual - item.qtyReturned}
									{@const profit = qtySold * product.priceBuy}
									<tr class="hover:bg-muted/30">
										{#if idx === 0}
											<td class="whitespace-nowrap px-4 py-3" rowspan={trx.items.length}>
												<input
													type="checkbox"
													checked={selectedIds.has(trx.id)}
													onchange={() => toggleSelect(trx.id)}
													class="h-4 w-4 rounded border-input"
												/>
											</td>
											<td class="whitespace-nowrap px-4 py-3" rowspan={trx.items.length}>
												<div class="flex items-center gap-2">
													<CalendarDays class="h-4 w-4 text-muted-foreground" />
													<span class="font-medium">{formatDate(trx.date)}</span>
												</div>
											</td>
										{/if}
										<td class="px-4 py-3">
											<div class="flex items-center gap-3">
												<div class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-muted overflow-hidden">
													{#if product.imageUrl}
														<img src={product.imageUrl} alt={product.name} class="h-full w-full object-cover" />
													{:else}
														<ImageOff class="h-4 w-4 text-muted-foreground" />
													{/if}
												</div>
												<div class="min-w-0">
													<p class="font-medium text-foreground truncate">{product.name}</p>
													<p class="text-xs text-muted-foreground">{formatCurrency(product.priceBuy)}</p>
												</div>
											</div>
										</td>
										<td class="whitespace-nowrap px-4 py-3 text-center font-medium">{item.qtyActual}</td>
										<td class="whitespace-nowrap px-4 py-3 text-center font-medium text-green-600">{qtySold}</td>
										<td class="whitespace-nowrap px-4 py-3 text-center font-medium text-red-600">{item.qtyReturned}</td>
										<td class="whitespace-nowrap px-4 py-3 text-right font-medium text-primary">{formatCurrency(profit)}</td>
										{#if idx === 0}
											<td class="px-4 py-3 text-center" rowspan={trx.items.length}>
												<span class="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium {status.class}">
													<status.Icon class="h-3 w-3" />
													{status.label}
												</span>
												{#if trx.status === 'completed'}
													<p class="mt-1 text-xs font-semibold text-green-600">{formatCurrency(trx.totalPayout)}</p>
												{/if}
											</td>
										{/if}
									</tr>
								{/each}
							{/if}
						{/each}
					</tbody>
				</table>
			</div>
		</Card>
	{/if}
</div>

<!-- Delete Confirmation Modal -->
{#if showDeleteConfirm}
	<div
		class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
		onclick={() => showDeleteConfirm = false}
		onkeydown={(e) => e.key === 'Escape' && (showDeleteConfirm = false)}
		role="button"
		tabindex="0"
		aria-label="Close"
	></div>
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4">
		<div class="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
			<div class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
				<AlertCircle class="h-6 w-6 text-destructive" />
			</div>
			<h2 class="text-lg font-semibold text-foreground">Hapus Riwayat?</h2>
			<p class="mt-2 text-sm text-muted-foreground">
				Anda akan menghapus <strong>{selectedIds.size} riwayat</strong> setoran.
				Tindakan ini tidak dapat dibatalkan.
			</p>
			<p class="mt-2 text-sm text-muted-foreground">
				💡 Tip: Export data terlebih dahulu sebagai backup sebelum menghapus.
			</p>
			<div class="mt-6 flex gap-3">
				<Button onclick={() => showDeleteConfirm = false} variant="outline" class="flex-1">
					Batal
				</Button>
				<form
					method="POST"
					action="?/delete"
					use:enhance={() => {
						deleteLoading = true;
						return async ({ result, update }) => {
							deleteLoading = false;
							if (result.type === 'success') {
								selectedIds = new Set();
								showDeleteConfirm = false;
								await invalidateAll();
							}
						};
					}}
					class="flex-1"
				>
					<input type="hidden" name="transactionIds" value={Array.from(selectedIds).join(',')} />
					<Button type="submit" variant="destructive" class="w-full gap-2" disabled={deleteLoading}>
						{#if deleteLoading}
							<div class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
						{:else}
							<Trash2 class="h-4 w-4" />
						{/if}
						Hapus
					</Button>
				</form>
			</div>
		</div>
	</div>
{/if}
