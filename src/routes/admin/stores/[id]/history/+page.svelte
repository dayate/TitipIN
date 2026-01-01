<script lang="ts">
	import { Card, Button } from '$lib/components/ui';
	import {
		ArrowLeft,
		CalendarDays,
		Package,
		User,
		Clock,
		CheckCircle2,
		FileText,
		RotateCcw
	} from 'lucide-svelte';

	let { data } = $props();

	let activeTab = $state<'all' | 'draft' | 'verified' | 'completed'>('all');

	let filteredTransactions = $derived(() => {
		if (activeTab === 'all') return data.transactions;
		return data.transactions.filter((t: { transaction: { status: string } }) => t.transaction.status === activeTab);
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
</script>

<svelte:head>
	<title>Riwayat Setoran - {data.store.name} - Mak Unyil</title>
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
		<h1 class="text-2xl font-bold text-foreground">Riwayat Setoran</h1>
		<p class="text-muted-foreground">{data.store.name}</p>
	</div>

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
				class="relative whitespace-nowrap px-4 py-2 text-sm font-medium transition-colors {activeTab === tab.key ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}"
			>
				{tab.label} ({tab.count})
				{#if activeTab === tab.key}
					<span class="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></span>
				{/if}
			</button>
		{/each}
	</div>

	<!-- Transactions List -->
	{#if filteredTransactions().length === 0}
		<Card class="py-12 text-center">
			<div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
				<Package class="h-8 w-8 text-muted-foreground" />
			</div>
			<h2 class="text-lg font-semibold text-foreground">Tidak ada transaksi</h2>
			<p class="mt-2 text-muted-foreground">Belum ada setoran pada kategori ini</p>
		</Card>
	{:else}
		<div class="space-y-4">
			{#each filteredTransactions() as { transaction, supplier, items }}
				{@const status = getStatusBadge(transaction.status)}
				<Card class="hover:border-primary/50 transition-colors">
					<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
						<!-- Left: Supplier & Date Info -->
						<div class="flex items-start gap-3">
							<div class="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
								<User class="h-5 w-5 text-primary" />
							</div>
							<div>
								<p class="font-semibold text-foreground">{supplier.name}</p>
								<div class="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
									<span class="flex items-center gap-1">
										<CalendarDays class="h-3 w-3" />
										{formatDate(transaction.date)}
									</span>
									<span>•</span>
									<span class="flex items-center gap-1">
										<Clock class="h-3 w-3" />
										Masuk: {formatDateTime(transaction.createdAt)}
									</span>
								</div>
							</div>
						</div>

						<!-- Right: Status & Stats -->
						<div class="flex items-center gap-4">
							<div class="text-right text-sm">
								<p class="text-muted-foreground">{items.length} produk</p>
								<p class="font-medium text-foreground">
									{formatCurrency(transaction.totalPayout)}
								</p>
							</div>
							<span
								class="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium {status.class}"
							>
								<status.Icon class="h-3 w-3" />
								{status.label}
							</span>
						</div>
					</div>

					<!-- Action Buttons based on status -->
					<div class="mt-4 flex justify-end gap-2 border-t border-border pt-4">
						<Button href="/admin/stores/{data.store.id}/history/{transaction.id}" size="sm" variant="outline" class="gap-1">
							<Package class="h-3 w-3" />
							Lihat Detail
						</Button>
						{#if transaction.status === 'draft'}
							<Button href="/admin/stores/{data.store.id}/validation" size="sm" variant="outline">
								Validasi
							</Button>
						{:else if transaction.status === 'verified'}
							<Button href="/admin/stores/{data.store.id}/return" size="sm" class="gap-1">
								<RotateCcw class="h-3 w-3" />
								Input Retur
							</Button>
						{/if}
					</div>
				</Card>
			{/each}
		</div>
	{/if}
</div>
