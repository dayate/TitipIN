<script lang="ts">
	import { Card, Button } from '$lib/components/ui';
	import {
		ArrowLeft,
		CalendarDays,
		Clock,
		CheckCircle2,
		FileText,
		ChevronDown,
		ChevronUp
	} from 'lucide-svelte';

	let { data } = $props();

	let expandedId = $state<number | null>(null);

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

	function toggleExpand(id: number) {
		expandedId = expandedId === id ? null : id;
	}
</script>

<svelte:head>
	<title>Riwayat Setoran - {data.store.name} - Mak Unyil</title>
</svelte:head>

<div class="space-y-6">
	<!-- Header -->
	<div>
		<a
			href="/app/stores"
			class="mb-2 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
		>
			<ArrowLeft class="h-4 w-4" />
			Kembali ke Lapak
		</a>
		<h1 class="text-2xl font-bold text-foreground">Riwayat Setoran</h1>
		<p class="text-muted-foreground">{data.store.name}</p>
	</div>

	<!-- Transactions List -->
	{#if data.transactions.length === 0}
		<Card class="py-12 text-center">
			<div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
				<FileText class="h-8 w-8 text-muted-foreground" />
			</div>
			<h2 class="text-lg font-semibold text-foreground">Belum ada riwayat</h2>
			<p class="mt-2 text-muted-foreground">Riwayat setoran Anda akan muncul di sini</p>
			<Button href="/app/{data.store.id}/setor" class="mt-4">
				Input Setoran
			</Button>
		</Card>
	{:else}
		<div class="space-y-4">
			{#each data.transactions as trx}
				{@const status = getStatusBadge(trx.status)}
				{@const isExpanded = expandedId === trx.id}
				<Card>
					<!-- Header -->
					<button
						type="button"
						onclick={() => toggleExpand(trx.id)}
						class="flex w-full items-center justify-between text-left"
					>
						<div class="flex items-center gap-4">
							<div
								class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10"
							>
								<CalendarDays class="h-6 w-6 text-primary" />
							</div>
							<div>
								<p class="font-semibold text-foreground">{formatDate(trx.date)}</p>
								<p class="text-sm text-muted-foreground">
									{trx.totalItemsIn} item masuk • {trx.totalItemsSold} terjual
								</p>
							</div>
						</div>
						<div class="flex items-center gap-4">
							<div class="text-right">
								<span
									class="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium {status.class}"
								>
									<status.Icon class="h-3 w-3" />
									{status.label}
								</span>
								{#if trx.status === 'completed'}
									<p class="mt-1 font-semibold text-green-600 dark:text-green-400">
										{formatCurrency(trx.totalPayout)}
									</p>
								{/if}
							</div>
							{#if isExpanded}
								<ChevronUp class="h-5 w-5 text-muted-foreground" />
							{:else}
								<ChevronDown class="h-5 w-5 text-muted-foreground" />
							{/if}
						</div>
					</button>

					<!-- Expanded Details -->
					{#if isExpanded}
						<div class="mt-4 border-t border-border pt-4">
							{#if trx.items.length === 0}
								<p class="text-sm text-muted-foreground">Tidak ada item</p>
							{:else}
								<div class="space-y-3">
									{#each trx.items as { item, product }}
										<div class="flex items-center justify-between rounded-lg bg-muted p-3">
											<div>
												<p class="font-medium text-foreground">{product.name}</p>
												<p class="text-sm text-muted-foreground">
													{formatCurrency(product.priceBuy)} per item
												</p>
											</div>
											<div class="text-right text-sm">
												<div class="grid grid-cols-3 gap-4 text-center">
													<div>
														<p class="text-muted-foreground">Rencana</p>
														<p class="font-medium text-foreground">{item.qtyPlanned}</p>
													</div>
													<div>
														<p class="text-muted-foreground">Aktual</p>
														<p class="font-medium text-foreground">{item.qtyActual}</p>
													</div>
													<div>
														<p class="text-muted-foreground">Terjual</p>
														<p class="font-medium text-green-600 dark:text-green-400">
															{item.qtyActual - item.qtyReturned}
														</p>
													</div>
												</div>
											</div>
										</div>
									{/each}
								</div>

								<!-- Summary -->
								<div class="mt-4 flex justify-end border-t border-border pt-4">
									<div class="text-right">
										<p class="text-sm text-muted-foreground">Total Pendapatan</p>
										<p class="text-xl font-bold text-green-600 dark:text-green-400">
											{formatCurrency(trx.totalPayout)}
										</p>
									</div>
								</div>
							{/if}
						</div>
					{/if}
				</Card>
			{/each}
		</div>
	{/if}
</div>
