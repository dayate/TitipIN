<script lang="ts">
	import { Card, Button } from '$lib/components/ui';
	import { enhance } from '$app/forms';
	import {
		Package,
		ArrowLeft,
		Clock,
		CheckCircle2,
		XCircle,
		ImageOff,
		Check,
		X,
		Trash2,
		User,
		ChevronDown,
		ChevronRight
	} from 'lucide-svelte';

	let { data, form } = $props();

	let activeTab = $state<'pending' | 'approved' | 'rejected' | 'all'>('pending');
	let expandedSuppliers = $state<Set<number>>(new Set());
	let rejectModal = $state<{ open: boolean; productId: number | null; productName: string }>({
		open: false,
		productId: null,
		productName: ''
	});
	let deleteModal = $state<{ open: boolean; productId: number | null; productName: string }>({
		open: false,
		productId: null,
		productName: ''
	});
	let rejectReason = $state('');
	let priceSellInputs = $state<Record<number, number>>({});

	// Filter products by supplier and status
	let filteredBySupplier = $derived(() => {
		return data.productsBySupplier
			.map((group) => ({
				supplier: group.supplier,
				products:
					activeTab === 'all'
						? group.products
						: group.products.filter((p) => p.product.status === activeTab)
			}))
			.filter((g) => g.products.length > 0);
	});

	function getStatusBadge(status: string) {
		switch (status) {
			case 'approved':
				return {
					class: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
					label: 'Disetujui',
					Icon: CheckCircle2
				};
			case 'rejected':
				return {
					class: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
					label: 'Ditolak',
					Icon: XCircle
				};
			default:
				return {
					class: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
					label: 'Menunggu',
					Icon: Clock
				};
		}
	}

	function formatCurrency(value: number) {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0
		}).format(value);
	}

	function toggleSupplier(id: number) {
		if (expandedSuppliers.has(id)) {
			expandedSuppliers.delete(id);
		} else {
			expandedSuppliers.add(id);
		}
		expandedSuppliers = new Set(expandedSuppliers);
	}

	function openRejectModal(productId: number, productName: string) {
		rejectModal = { open: true, productId, productName };
		rejectReason = '';
	}

	function closeRejectModal() {
		rejectModal = { open: false, productId: null, productName: '' };
	}

	function openDeleteModal(productId: number, productName: string) {
		deleteModal = { open: true, productId, productName };
	}

	function closeDeleteModal() {
		deleteModal = { open: false, productId: null, productName: '' };
	}
</script>

<svelte:head>
	<title>Kelola Produk - {data.store.name} - Mak Unyil</title>
</svelte:head>

<div class="space-y-6">
	<div>
		<a
			href="/admin/stores/{data.store.id}"
			class="mb-2 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
		>
			<ArrowLeft class="h-4 w-4" />
			Kembali ke Detail Lapak
		</a>
		<h1 class="text-2xl font-bold text-foreground">Kelola Produk</h1>
		<p class="text-muted-foreground">{data.store.name}</p>
	</div>

	<!-- Success Message -->
	{#if form?.success}
		<div
			class="flex items-center gap-2 rounded-lg p-3 text-sm {form.action === 'approve'
				? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
				: form.action === 'delete'
					? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
					: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}"
		>
			{#if form.action === 'approve'}
				<CheckCircle2 class="h-4 w-4" /> Produk "{form.productName}" berhasil disetujui
			{:else if form.action === 'delete'}
				<Trash2 class="h-4 w-4" /> Produk "{form.productName}" berhasil dihapus
			{:else}
				<XCircle class="h-4 w-4" /> Produk "{form.productName}" berhasil ditolak
			{/if}
		</div>
	{/if}

	<!-- Tabs -->
	<div class="flex gap-2 border-b border-border overflow-x-auto">
		{#each [{ key: 'pending', label: 'Menunggu', count: data.counts.pending }, { key: 'approved', label: 'Disetujui', count: data.counts.approved }, { key: 'rejected', label: 'Ditolak', count: data.counts.rejected }, { key: 'all', label: 'Semua', count: data.counts.pending + data.counts.approved + data.counts.rejected }] as tab}
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

	<!-- Products by Supplier -->
	{#if filteredBySupplier().length === 0}
		<Card class="py-12 text-center">
			<div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
				<Package class="h-8 w-8 text-muted-foreground" />
			</div>
			<h2 class="text-lg font-semibold text-foreground">Tidak ada produk</h2>
		</Card>
	{:else}
		<div class="space-y-4">
			{#each filteredBySupplier() as { supplier, products }}
				<Card>
					<!-- Supplier Header -->
					<button
						onclick={() => toggleSupplier(supplier.id)}
						class="flex w-full items-center justify-between p-4 hover:bg-muted/50 rounded-lg"
					>
						<div class="flex items-center gap-3">
							<div class="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
								<User class="h-5 w-5 text-primary" />
							</div>
							<div class="text-left">
								<p class="font-semibold text-foreground">{supplier.name}</p>
								<p class="text-sm text-muted-foreground">{products.length} produk</p>
							</div>
						</div>
						{#if expandedSuppliers.has(supplier.id)}
							<ChevronDown class="h-5 w-5 text-muted-foreground" />
						{:else}
							<ChevronRight class="h-5 w-5 text-muted-foreground" />
						{/if}
					</button>

					<!-- Products -->
					{#if expandedSuppliers.has(supplier.id)}
						<div class="border-t border-border p-4 space-y-4">
							{#each products as { product }}
								{@const status = getStatusBadge(product.status)}
								<div
									class="flex flex-col gap-4 sm:flex-row sm:items-center rounded-lg bg-muted/50 p-4"
								>
									<!-- Image -->
									<div
										class="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg bg-muted"
									>
										{#if product.imageUrl}
											<img
												src={product.imageUrl}
												alt={product.name}
												class="h-full w-full rounded-lg object-cover"
											/>
										{:else}
											<ImageOff class="h-6 w-6 text-muted-foreground" />
										{/if}
									</div>

									<!-- Info -->
									<div class="min-w-0 flex-1">
										<div class="flex items-start justify-between gap-2">
											<h3 class="font-semibold text-foreground">{product.name}</h3>
											<span
												class="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium {status.class}"
											>
												<status.Icon class="h-3 w-3" />
												{status.label}
											</span>
										</div>
										<div class="mt-1 flex gap-4 text-sm">
											<span
												>Setor: <span class="font-medium">{formatCurrency(product.priceBuy)}</span
												></span
											>
											{#if product.status === 'approved'}
												<span
													>Jual: <span class="font-medium">{formatCurrency(product.priceSell)}</span
													></span
												>
											{/if}
										</div>
									</div>

									<!-- Actions -->
									<div class="flex gap-2 flex-shrink-0">
										{#if product.status === 'pending'}
											<form
												method="POST"
												action="?/approve"
												use:enhance
												class="flex gap-2 items-end"
											>
												<input type="hidden" name="productId" value={product.id} />
												<div class="flex flex-col">
													<label for="price-{product.id}" class="text-xs text-muted-foreground"
														>Harga Jual</label
													>
													{#if product.suggestedPriceSell}
														<span class="text-xs text-primary mb-1"
															>💡 Saran: {formatCurrency(product.suggestedPriceSell)}</span
														>
													{/if}
													<input
														id="price-{product.id}"
														type="number"
														name="priceSell"
														value={priceSellInputs[product.id] ||
															product.suggestedPriceSell ||
															Math.round(product.priceBuy * 1.3)}
														onchange={(e) =>
															(priceSellInputs[product.id] = parseInt(e.currentTarget.value) || 0)}
														class="w-24 rounded border border-input bg-background px-2 py-1 text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
														min={product.priceBuy}
														required
													/>
												</div>
												<Button type="submit" size="sm" class="gap-1"
													><Check class="h-3 w-3" /> Setujui</Button
												>
											</form>
											<Button
												size="sm"
												variant="outline"
												class="text-destructive"
												onclick={() => openRejectModal(product.id, product.name)}
											>
												<X class="h-3 w-3" />
											</Button>
										{/if}
										<Button
											size="sm"
											variant="outline"
											class="text-destructive"
											onclick={() => openDeleteModal(product.id, product.name)}
										>
											<Trash2 class="h-3 w-3" />
										</Button>
									</div>
								</div>
							{/each}
						</div>
					{/if}
				</Card>
			{/each}
		</div>
	{/if}
</div>

<!-- Reject Modal -->
{#if rejectModal.open}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
		<Card class="w-full max-w-md">
			<h3 class="text-lg font-semibold text-foreground">Tolak Produk?</h3>
			<p class="mt-2 text-muted-foreground">Produk "{rejectModal.productName}" akan ditolak.</p>
			<form
				method="POST"
				action="?/reject"
				use:enhance={() => {
					return async ({ update }) => {
						closeRejectModal();
						await update();
					};
				}}
				class="mt-4 space-y-4"
			>
				<input type="hidden" name="productId" value={rejectModal.productId} />
				<div class="space-y-2">
					<label for="reason" class="text-sm font-medium text-foreground">Alasan (Opsional)</label>
					<textarea
						id="reason"
						name="reason"
						rows="3"
						class="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
						bind:value={rejectReason}
					></textarea>
				</div>
				<div class="flex gap-3">
					<Button type="button" variant="outline" class="flex-1" onclick={closeRejectModal}
						>Batal</Button
					>
					<Button type="submit" variant="destructive" class="flex-1">Tolak</Button>
				</div>
			</form>
		</Card>
	</div>
{/if}

<!-- Delete Modal -->
{#if deleteModal.open}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
		<Card class="w-full max-w-md">
			<h3 class="text-lg font-semibold text-foreground">Hapus Produk?</h3>
			<p class="mt-2 text-muted-foreground">
				Produk "{deleteModal.productName}" akan dihapus secara permanen. Tindakan ini tidak dapat
				dibatalkan.
			</p>
			<form
				method="POST"
				action="?/delete"
				use:enhance={() => {
					return async ({ update }) => {
						closeDeleteModal();
						await update();
					};
				}}
				class="mt-4 space-y-4"
			>
				<input type="hidden" name="productId" value={deleteModal.productId} />
				<div class="flex gap-3">
					<Button type="button" variant="outline" class="flex-1" onclick={closeDeleteModal}
						>Batal</Button
					>
					<Button type="submit" variant="destructive" class="flex-1">Hapus</Button>
				</div>
			</form>
		</Card>
	</div>
{/if}
