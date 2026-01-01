<script lang="ts">
	import { Card, Button } from '$lib/components/ui';
	import {
		ArrowLeft,
		CalendarDays,
		Clock,
		User,
		Package,
		CheckCircle2,
		FileText,
		ImageOff,
		TrendingUp,
		RotateCcw,
		DollarSign,
		Wallet
	} from 'lucide-svelte';

	let { data } = $props();

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

	function formatDateTime(date: Date | string | null) {
		if (!date) return '-';
		const d = typeof date === 'string' ? new Date(date) : date;
		return d.toLocaleString('id-ID', {
			day: 'numeric',
			month: 'short',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function getStatusBadge(status: string) {
		switch (status) {
			case 'completed':
				return { class: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', label: 'Selesai', Icon: CheckCircle2 };
			case 'verified':
				return { class: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', label: 'Tervalidasi', Icon: FileText };
			default:
				return { class: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', label: 'Draft', Icon: Clock };
		}
	}

	const status = getStatusBadge(data.transaction.status);
</script>

<svelte:head>
	<title>Detail Transaksi - {data.store.name} - Mak Unyil</title>
</svelte:head>

<div class="mx-auto max-w-4xl space-y-6">
	<!-- Header -->
	<div>
		<a
			href="/admin/stores/{data.store.id}/history"
			class="mb-2 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
		>
			<ArrowLeft class="h-4 w-4" />
			Kembali ke Riwayat
		</a>
		<div class="flex items-start justify-between">
			<div>
				<h1 class="text-2xl font-bold text-foreground">Detail Transaksi</h1>
				<p class="text-muted-foreground">{data.store.name}</p>
			</div>
			<span class="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium {status.class}">
				<status.Icon class="h-4 w-4" />
				{status.label}
			</span>
		</div>
	</div>

	<!-- Transaction Info -->
	<Card>
		<div class="flex flex-wrap items-center gap-6">
			<div class="flex items-center gap-3">
				<div class="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
					<User class="h-6 w-6 text-primary" />
				</div>
				<div>
					<p class="text-sm text-muted-foreground">Penyetor</p>
					<p class="font-semibold text-foreground">{data.transaction.supplierId}</p>
				</div>
			</div>
			<div class="flex items-center gap-3">
				<div class="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
					<CalendarDays class="h-6 w-6 text-muted-foreground" />
				</div>
				<div>
					<p class="text-sm text-muted-foreground">Tanggal Setoran</p>
					<p class="font-semibold text-foreground">{formatDate(data.transaction.date)}</p>
				</div>
			</div>
			<div class="flex items-center gap-3">
				<div class="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
					<Clock class="h-6 w-6 text-muted-foreground" />
				</div>
				<div>
					<p class="text-sm text-muted-foreground">Waktu Masuk</p>
					<p class="font-semibold text-foreground">{formatDateTime(data.transaction.createdAt)}</p>
				</div>
			</div>
		</div>
	</Card>

	<!-- Summary Cards -->
	<div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
		<Card class="bg-gradient-to-br from-blue-500/10 to-blue-600/5">
			<div class="flex items-center gap-3">
				<Package class="h-8 w-8 text-blue-500" />
				<div>
					<p class="text-2xl font-bold text-foreground">{data.summary.totalQtyActual}</p>
					<p class="text-xs text-muted-foreground">Masuk</p>
				</div>
			</div>
		</Card>
		<Card class="bg-gradient-to-br from-green-500/10 to-green-600/5">
			<div class="flex items-center gap-3">
				<TrendingUp class="h-8 w-8 text-green-500" />
				<div>
					<p class="text-2xl font-bold text-foreground">{data.summary.totalQtySold}</p>
					<p class="text-xs text-muted-foreground">Terjual</p>
				</div>
			</div>
		</Card>
		<Card class="bg-gradient-to-br from-orange-500/10 to-orange-600/5">
			<div class="flex items-center gap-3">
				<RotateCcw class="h-8 w-8 text-orange-500" />
				<div>
					<p class="text-2xl font-bold text-foreground">{data.summary.totalQtyReturned}</p>
					<p class="text-xs text-muted-foreground">Retur</p>
				</div>
			</div>
		</Card>
		<Card class="bg-gradient-to-br from-purple-500/10 to-purple-600/5">
			<div class="flex items-center gap-3">
				<Wallet class="h-8 w-8 text-purple-500" />
				<div>
					<p class="text-lg font-bold text-foreground">{formatCurrency(data.summary.totalPayout)}</p>
					<p class="text-xs text-muted-foreground">Bayar Supplier</p>
				</div>
			</div>
		</Card>
	</div>

	<!-- Products Table -->
	<Card>
		<h3 class="mb-4 text-lg font-semibold text-foreground">Detail Produk</h3>

		{#if data.items.length === 0}
			<p class="text-center text-muted-foreground py-8">Tidak ada item</p>
		{:else}
			<div class="space-y-4">
				{#each data.items as { item, product }}
					{@const sold = item.qtyActual - item.qtyReturned}
					{@const revenue = sold * product.priceSell}
					{@const profit = sold * (product.priceSell - product.priceBuy)}

					<div class="flex flex-col gap-4 rounded-xl border border-border bg-muted/30 p-4 sm:flex-row sm:items-center">
						<!-- Product Image & Name -->
						<div class="flex items-center gap-4 sm:w-64">
							<div class="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg bg-muted overflow-hidden">
								{#if product.imageUrl}
									<img src={product.imageUrl} alt={product.name} class="h-full w-full object-cover" />
								{:else}
									<ImageOff class="h-6 w-6 text-muted-foreground" />
								{/if}
							</div>
							<div class="min-w-0">
								<p class="font-semibold text-foreground truncate">{product.name}</p>
								<div class="flex gap-3 text-xs text-muted-foreground">
									<span>Setor: {formatCurrency(product.priceBuy)}</span>
									<span>Jual: {formatCurrency(product.priceSell)}</span>
								</div>
							</div>
						</div>

						<!-- Quantities -->
						<div class="flex flex-1 justify-around gap-4 text-center sm:justify-end">
							<div>
								<p class="text-lg font-bold text-blue-600">{item.qtyActual}</p>
								<p class="text-xs text-muted-foreground">Masuk</p>
							</div>
							<div>
								<p class="text-lg font-bold text-green-600">{sold}</p>
								<p class="text-xs text-muted-foreground">Terjual</p>
							</div>
							<div>
								<p class="text-lg font-bold text-orange-600">{item.qtyReturned}</p>
								<p class="text-xs text-muted-foreground">Retur</p>
							</div>
							<div class="hidden sm:block">
								<p class="text-lg font-bold text-foreground">{formatCurrency(revenue)}</p>
								<p class="text-xs text-muted-foreground">Omset</p>
							</div>
							<div class="hidden sm:block">
								<p class="text-lg font-bold text-purple-600">{formatCurrency(profit)}</p>
								<p class="text-xs text-muted-foreground">Profit</p>
							</div>
						</div>
					</div>
				{/each}
			</div>

			<!-- Financial Summary -->
			<div class="mt-6 rounded-xl border border-primary/30 bg-primary/5 p-4">
				<div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
					<div class="text-center">
						<p class="text-sm text-muted-foreground">Total Omset</p>
						<p class="text-xl font-bold text-foreground">{formatCurrency(data.summary.totalRevenue)}</p>
					</div>
					<div class="text-center">
						<p class="text-sm text-muted-foreground">Profit Lapak</p>
						<p class="text-xl font-bold text-green-600">{formatCurrency(data.summary.totalProfit)}</p>
					</div>
					<div class="text-center">
						<p class="text-sm text-muted-foreground">Bayar Supplier</p>
						<p class="text-xl font-bold text-purple-600">{formatCurrency(data.summary.totalPayout)}</p>
					</div>
					<div class="text-center">
						<p class="text-sm text-muted-foreground">Margin</p>
						<p class="text-xl font-bold text-foreground">
							{data.summary.totalRevenue > 0 ? Math.round((data.summary.totalProfit / data.summary.totalRevenue) * 100) : 0}%
						</p>
					</div>
				</div>
			</div>
		{/if}
	</Card>

	<!-- Actions -->
	{#if data.transaction.status === 'draft'}
		<div class="flex justify-end">
			<Button href="/admin/stores/{data.store.id}/validation">Validasi Setoran</Button>
		</div>
	{:else if data.transaction.status === 'verified'}
		<div class="flex justify-end">
			<Button href="/admin/stores/{data.store.id}/return" class="gap-2">
				<RotateCcw class="h-4 w-4" />
				Input Retur
			</Button>
		</div>
	{/if}
</div>
