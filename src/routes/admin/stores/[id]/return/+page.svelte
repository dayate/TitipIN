<script lang="ts">
	import { Card, Button } from '$lib/components/ui';
	import { enhance } from '$app/forms';
	import { ArrowLeft, CalendarDays, CheckCircle2, Package, User, Plus, Minus } from 'lucide-svelte';

	let { data, form } = $props();

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
			weekday: 'long',
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}

	// Initialize quantities
	function initQty() {
		const initial: Record<number, Record<number, number>> = {};
		for (const { transaction, items } of data.transactions) {
			initial[transaction.id] = {};
			for (const { item, product } of items) {
				initial[transaction.id][product.id] = 0;
			}
		}
		return initial;
	}

	let returnedQuantities = $state<Record<number, Record<number, number>>>(initQty());

	function getQty(trxId: number, productId: number): number {
		return returnedQuantities[trxId]?.[productId] ?? 0;
	}

	function setQty(trxId: number, productId: number, value: number) {
		if (!returnedQuantities[trxId]) {
			returnedQuantities[trxId] = {};
		}
		returnedQuantities[trxId][productId] = Math.max(0, value);
	}

	function increment(trxId: number, productId: number, max: number) {
		const current = getQty(trxId, productId);
		if (current < max) {
			setQty(trxId, productId, current + 1);
		}
	}

	function decrement(trxId: number, productId: number) {
		const current = getQty(trxId, productId);
		if (current > 0) {
			setQty(trxId, productId, current - 1);
		}
	}

	function calculatePayout(trxId: number, items: any[]) {
		let total = 0;
		for (const { item, product } of items) {
			const returned = getQty(trxId, product.id);
			const sold = item.qtyActual - returned;
			total += sold * product.priceBuy;
		}
		return total;
	}
</script>

<svelte:head>
	<title>Input Retur - {data.store.name} - Mak Unyil</title>
</svelte:head>

<div class="space-y-6">
	<!-- Header -->
	<div>
		<a
			href="/admin/stores/{data.store.id}"
			class="mb-2 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
		>
			<ArrowLeft class="h-4 w-4" />
			Kembali ke Detail Lapak
		</a>
		<h1 class="text-2xl font-bold text-foreground">Input Retur</h1>
		<p class="text-muted-foreground">{data.store.name}</p>
	</div>

	<!-- Success Message -->
	{#if form?.success}
		<div
			class="flex items-center gap-2 rounded-lg bg-green-100 p-3 text-sm text-green-700 dark:bg-green-900/30 dark:text-green-400"
		>
			<CheckCircle2 class="h-4 w-4" />
			Transaksi berhasil diselesaikan
		</div>
	{/if}

	<!-- Transactions List -->
	{#if data.transactions.length === 0}
		<Card class="py-12 text-center">
			<div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
				<Package class="h-8 w-8 text-muted-foreground" />
			</div>
			<h2 class="text-lg font-semibold text-foreground">Tidak ada transaksi</h2>
			<p class="mt-2 text-muted-foreground">
				Belum ada transaksi tervalidasi yang perlu diinput retur
			</p>
		</Card>
	{:else}
		<div class="space-y-6">
			{#each data.transactions as { transaction, supplier, items }}
				<Card>
					<form method="POST" action="?/complete" use:enhance>
						<input type="hidden" name="trxId" value={transaction.id} />

						<!-- Supplier Header -->
						<div class="mb-4 flex items-center justify-between gap-3 border-b border-border pb-4">
							<div class="flex items-center gap-3">
								<div class="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
									<User class="h-5 w-5 text-primary" />
								</div>
								<div>
									<p class="font-semibold text-foreground">{supplier.name}</p>
									<p class="text-sm text-muted-foreground">{supplier.whatsapp}</p>
								</div>
							</div>
							<div class="text-right text-sm">
								<p class="font-medium">{formatDate(transaction.date)}</p>
							</div>
						</div>

						<!-- Items -->
						{#if items.length === 0}
							<p class="text-muted-foreground">Tidak ada item</p>
						{:else}
							<div class="space-y-3">
								{#each items as { item, product }}
									{@const returned = getQty(transaction.id, product.id)}
									{@const sold = item.qtyActual - returned}
									<div class="flex items-center justify-between rounded-lg bg-muted/50 p-3">
										<div class="flex-1">
											<p class="font-medium text-foreground">{product.name}</p>
											<p class="text-xs text-muted-foreground">
												{formatCurrency(product.priceBuy)}
											</p>
										</div>

										<!-- Masuk -->
										<div class="mx-3 text-center">
											<p class="text-xs text-muted-foreground">Masuk</p>
											<p class="text-lg font-bold">{item.qtyActual}</p>
										</div>

										<!-- Retur with +/- buttons -->
										<div class="text-center">
											<p class="text-xs text-muted-foreground mb-1">Retur</p>
											<input type="hidden" name="itemId" value={product.id} />
											<input type="hidden" name="qtyReturned" value={returned} />
											<div
												class="inline-flex items-center rounded-lg border border-border overflow-hidden"
											>
												<button
													type="button"
													onclick={() => decrement(transaction.id, product.id)}
													disabled={returned <= 0}
													class="flex h-8 w-8 items-center justify-center bg-muted hover:bg-muted/80 disabled:opacity-40 transition-colors"
												>
													<Minus class="h-3 w-3" />
												</button>
												<span class="w-10 text-center font-bold text-foreground bg-background">
													{returned}
												</span>
												<button
													type="button"
													onclick={() => increment(transaction.id, product.id, item.qtyActual)}
													disabled={returned >= item.qtyActual}
													class="flex h-8 w-8 items-center justify-center bg-muted hover:bg-muted/80 disabled:opacity-40 transition-colors"
												>
													<Plus class="h-3 w-3" />
												</button>
											</div>
										</div>

										<!-- Terjual -->
										<div class="mx-3 text-center">
											<p class="text-xs text-muted-foreground">Terjual</p>
											<p class="text-lg font-bold text-green-600 dark:text-green-400">{sold}</p>
										</div>
									</div>
								{/each}
							</div>

							<!-- Total Payout -->
							<div class="mt-4 flex items-center justify-between border-t border-border pt-4">
								<div>
									<p class="text-sm text-muted-foreground">Total Pembayaran ke Supplier</p>
									<p class="text-2xl font-bold text-green-600 dark:text-green-400">
										{formatCurrency(calculatePayout(transaction.id, items))}
									</p>
								</div>
								<Button type="submit" size="sm" class="gap-2">
									<CheckCircle2 class="h-4 w-4" />
									Selesaikan
								</Button>
							</div>
						{/if}
					</form>
				</Card>
			{/each}
		</div>
	{/if}
</div>
