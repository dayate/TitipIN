<script lang="ts">
	import { Card, Button } from '$lib/components/ui';
	import { enhance } from '$app/forms';
	import { goto, invalidateAll } from '$app/navigation';
	import {
		ArrowLeft,
		CalendarDays,
		Package,
		User,
		Clock,
		CheckCircle2,
		FileText,
		RotateCcw,
		ImageOff,
		Filter,
		Download,
		Trash2,
		X,
		AlertCircle
	} from 'lucide-svelte';

	let { data, form } = $props();

	// Filter states
	let activeTab = $state<'all' | 'draft' | 'verified' | 'completed'>('all');
	let startDate = $state(data.filters?.startDate || '');
	let endDate = $state(data.filters?.endDate || '');
	let showFilters = $state(false);

	// Selection states for delete
	let selectedIds = $state<Set<number>>(new Set());
	let showDeleteConfirm = $state(false);
	let deleteLoading = $state(false);

	let filteredTransactions = $derived(() => {
		if (activeTab === 'all') return data.transactions;
		return data.transactions.filter(
			(t: { transaction: { status: string } }) => t.transaction.status === activeTab
		);
	});

	function formatCurrency(value: number) {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0
		}).format(value);
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

	function formatDateTime(date: Date | string | null) {
		if (!date) return '-';
		const d = typeof date === 'string' ? new Date(date) : date;
		return d.toLocaleString('id-ID', {
			day: 'numeric',
			month: 'short',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

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
					label: 'Tervalidasi',
					Icon: FileText
				};
			default:
				return {
					class: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
					label: 'Draft',
					Icon: Clock
				};
		}
	}

	function applyFilters() {
		const params = new URLSearchParams();
		if (startDate) params.set('startDate', startDate);
		if (endDate) params.set('endDate', endDate);
		goto(`?${params.toString()}`, { invalidateAll: true });
	}

	function clearFilters() {
		startDate = '';
		endDate = '';
		goto('?', { invalidateAll: true });
	}

	function toggleSelectAll() {
		const currentFiltered = filteredTransactions();
		if (selectedIds.size === currentFiltered.length) {
			selectedIds = new Set();
		} else {
			selectedIds = new Set(currentFiltered.map((t: any) => t.transaction.id));
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
		if (startDate) params.set('startDate', startDate);
		if (endDate) params.set('endDate', endDate);
		const query = params.toString();
		return `/admin/stores/${data.store.id}/history/export${query ? '?' + query : ''}`;
	});

	let hasFilters = $derived(startDate || endDate);
</script>

<svelte:head>
	<title>Riwayat Setoran - {data.store.name} - Mak Unyil</title>
</svelte:head>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<div>
			<a
				href="/admin/stores/{data.store.id}"
				class="mb-2 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
			>
				<ArrowLeft class="h-4 w-4" />
				Kembali ke Detail Lapak
			</a>
			<h1 class="text-2xl font-bold text-foreground">Riwayat Setoran</h1>
			<p class="text-muted-foreground">{data.store.name}</p>
		</div>
		<div class="flex items-center gap-2">
			<Button onclick={() => (showFilters = !showFilters)} variant="outline" class="gap-2">
				<Filter class="h-4 w-4" />
				Filter
				{#if hasFilters}
					<span
						class="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground"
						>!</span
					>
				{/if}
			</Button>
			<Button
				href={exportUrl()}
				variant="outline"
				class="gap-2"
				disabled={data.transactions.length === 0}
			>
				<Download class="h-4 w-4" />
				Export CSV
			</Button>
			{#if selectedIds.size > 0}
				<Button onclick={() => (showDeleteConfirm = true)} variant="destructive" class="gap-2">
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
					<button onclick={() => (showFilters = false)} class="rounded-lg p-1 hover:bg-muted">
						<X class="h-4 w-4" />
					</button>
				</div>
				<div class="grid gap-4 sm:grid-cols-2">
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
			<p class="text-2xl font-bold text-foreground">{data.counts.total}</p>
			<p class="text-sm text-muted-foreground">Total</p>
		</Card>
		<Card class="text-center">
			<p class="text-2xl font-bold text-yellow-600">{data.counts.draft}</p>
			<p class="text-sm text-muted-foreground">Draft</p>
		</Card>
		<Card class="text-center">
			<p class="text-2xl font-bold text-blue-600">{data.counts.verified}</p>
			<p class="text-sm text-muted-foreground">Tervalidasi</p>
		</Card>
		<Card class="text-center">
			<p class="text-2xl font-bold text-green-600">{data.counts.completed}</p>
			<p class="text-sm text-muted-foreground">Selesai</p>
		</Card>
	</div>

	<!-- Tabs -->
	<div class="flex gap-2 overflow-x-auto border-b border-border">
		{#each [{ key: 'all', label: 'Semua', count: data.counts.total }, { key: 'draft', label: 'Draft', count: data.counts.draft }, { key: 'verified', label: 'Tervalidasi', count: data.counts.verified }, { key: 'completed', label: 'Selesai', count: data.counts.completed }] as tab}
			<button
				onclick={() => (activeTab = tab.key as any)}
				class="relative whitespace-nowrap px-4 py-2 text-sm font-medium transition-colors {activeTab ===
				tab.key
					? 'text-primary'
					: 'text-muted-foreground hover:text-foreground'}"
			>
				{tab.label} ({tab.count})
				{#if activeTab === tab.key}
					<span class="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></span>
				{/if}
			</button>
		{/each}
	</div>

	<!-- Transactions Table -->
	{#if filteredTransactions().length === 0}
		<Card class="py-12 text-center">
			<div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
				<Package class="h-8 w-8 text-muted-foreground" />
			</div>
			<h2 class="text-lg font-semibold text-foreground">Tidak ada transaksi</h2>
			<p class="mt-2 text-muted-foreground">Belum ada setoran pada kategori ini</p>
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
									checked={selectedIds.size === filteredTransactions().length &&
										filteredTransactions().length > 0}
									onchange={toggleSelectAll}
									class="h-4 w-4 rounded border-input"
								/>
							</th>
							<th class="whitespace-nowrap px-4 py-3 text-left font-medium text-muted-foreground"
								>Penyetor</th
							>
							<th class="whitespace-nowrap px-4 py-3 text-left font-medium text-muted-foreground"
								>Tanggal</th
							>
							<th class="whitespace-nowrap px-4 py-3 text-left font-medium text-muted-foreground"
								>Produk</th
							>
							<th class="whitespace-nowrap px-4 py-3 text-center font-medium text-muted-foreground"
								>Masuk</th
							>
							<th class="whitespace-nowrap px-4 py-3 text-center font-medium text-muted-foreground"
								>Terjual</th
							>
							<th class="whitespace-nowrap px-4 py-3 text-center font-medium text-muted-foreground"
								>Retur</th
							>
							<th class="whitespace-nowrap px-4 py-3 text-right font-medium text-muted-foreground"
								>Payout</th
							>
							<th class="whitespace-nowrap px-4 py-3 text-center font-medium text-muted-foreground"
								>Status</th
							>
							<th class="whitespace-nowrap px-4 py-3 text-center font-medium text-muted-foreground"
								>Aksi</th
							>
						</tr>
					</thead>
					<tbody class="divide-y divide-border">
						{#each filteredTransactions() as { transaction, supplier, items }}
							{@const status = getStatusBadge(transaction.status)}
							{#if items.length === 0}
								<tr class="hover:bg-muted/30">
									<td class="whitespace-nowrap px-4 py-3">
										<input
											type="checkbox"
											checked={selectedIds.has(transaction.id)}
											onchange={() => toggleSelect(transaction.id)}
											class="h-4 w-4 rounded border-input"
										/>
									</td>
									<td class="whitespace-nowrap px-4 py-3">
										<div class="flex items-center gap-2">
											<div
												class="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10"
											>
												<User class="h-4 w-4 text-primary" />
											</div>
											<span class="font-medium">{supplier.name}</span>
										</div>
									</td>
									<td class="whitespace-nowrap px-4 py-3">
										<div class="flex items-center gap-2">
											<CalendarDays class="h-4 w-4 text-muted-foreground" />
											<span>{formatDate(transaction.date)}</span>
										</div>
									</td>
									<td class="px-4 py-3 text-muted-foreground" colspan="5">Tidak ada item</td>
									<td class="px-4 py-3 text-center">
										<span
											class="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium {status.class}"
										>
											<status.Icon class="h-3 w-3" />
											{status.label}
										</span>
									</td>
									<td class="px-4 py-3 text-center">
										<Button
											href="/admin/stores/{data.store.id}/history/{transaction.id}"
											size="sm"
											variant="outline"
										>
											Detail
										</Button>
									</td>
								</tr>
							{:else}
								{#each items as { item, product }, idx}
									{@const qtySold = item.qtyActual - item.qtyReturned}
									<tr class="hover:bg-muted/30">
										{#if idx === 0}
											<td class="whitespace-nowrap px-4 py-3" rowspan={items.length}>
												<input
													type="checkbox"
													checked={selectedIds.has(transaction.id)}
													onchange={() => toggleSelect(transaction.id)}
													class="h-4 w-4 rounded border-input"
												/>
											</td>
											<td class="whitespace-nowrap px-4 py-3" rowspan={items.length}>
												<div class="flex items-center gap-2">
													<div
														class="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10"
													>
														<User class="h-4 w-4 text-primary" />
													</div>
													<span class="font-medium">{supplier.name}</span>
												</div>
											</td>
											<td class="whitespace-nowrap px-4 py-3" rowspan={items.length}>
												<div class="flex items-center gap-2">
													<CalendarDays class="h-4 w-4 text-muted-foreground" />
													<div>
														<p class="font-medium">{formatDate(transaction.date)}</p>
														<p class="text-xs text-muted-foreground">
															{formatDateTime(transaction.createdAt)}
														</p>
													</div>
												</div>
											</td>
										{/if}
										<td class="px-4 py-3">
											<div class="flex items-center gap-3">
												<div
													class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-muted overflow-hidden"
												>
													{#if product.imageUrl}
														<img
															src={product.imageUrl}
															alt={product.name}
															class="h-full w-full object-cover"
														/>
													{:else}
														<ImageOff class="h-4 w-4 text-muted-foreground" />
													{/if}
												</div>
												<div class="min-w-0">
													<p class="font-medium text-foreground truncate">{product.name}</p>
													<p class="text-xs text-muted-foreground">
														Setor: {formatCurrency(product.priceBuy)} | Jual: {formatCurrency(
															product.priceSell
														)}
													</p>
												</div>
											</div>
										</td>
										<td class="whitespace-nowrap px-4 py-3 text-center font-medium"
											>{item.qtyActual}</td
										>
										<td class="whitespace-nowrap px-4 py-3 text-center font-medium text-green-600"
											>{qtySold}</td
										>
										<td class="whitespace-nowrap px-4 py-3 text-center font-medium text-red-600"
											>{item.qtyReturned}</td
										>
										{#if idx === 0}
											<td
												class="whitespace-nowrap px-4 py-3 text-right font-medium text-primary"
												rowspan={items.length}
											>
												{formatCurrency(transaction.totalPayout)}
											</td>
											<td class="px-4 py-3 text-center" rowspan={items.length}>
												<span
													class="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium {status.class}"
												>
													<status.Icon class="h-3 w-3" />
													{status.label}
												</span>
											</td>
											<td class="px-4 py-3 text-center" rowspan={items.length}>
												<div class="flex flex-col gap-1">
													<Button
														href="/admin/stores/{data.store.id}/history/{transaction.id}"
														size="sm"
														variant="outline"
													>
														Detail
													</Button>
													{#if transaction.status === 'draft'}
														<Button
															href="/admin/stores/{data.store.id}/validation"
															size="sm"
															variant="outline"
														>
															Validasi
														</Button>
													{:else if transaction.status === 'verified'}
														<Button
															href="/admin/stores/{data.store.id}/return"
															size="sm"
															class="gap-1"
														>
															<RotateCcw class="h-3 w-3" />
															Retur
														</Button>
													{/if}
												</div>
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
		onclick={() => (showDeleteConfirm = false)}
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
				Anda akan menghapus <strong>{selectedIds.size} riwayat</strong> setoran. Tindakan ini tidak dapat
				dibatalkan.
			</p>
			<p class="mt-2 text-sm text-muted-foreground">
				💡 Tip: Export data terlebih dahulu sebagai backup sebelum menghapus.
			</p>
			<div class="mt-6 flex gap-3">
				<Button onclick={() => (showDeleteConfirm = false)} variant="outline" class="flex-1">
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
							<div
								class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
							></div>
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
