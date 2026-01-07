<script lang="ts">
	import { formatCurrency } from '$lib/utils';
	import { Card, Button } from '$lib/components/ui';
	import {
		ArrowLeft,
		Calendar,
		Download,
		ChevronLeft,
		ChevronRight,
		FileText,
		TrendingUp,
		Users,
		Printer
	} from 'lucide-svelte';

	export let data;

	$: store = data.store;
	$: report = data.report;
	$: reportType = data.reportType;
	$: offset = data.offset;
</script>

<svelte:head>
	<title>Laporan - {store.name}</title>
</svelte:head>

<div class="container max-w-4xl mx-auto p-4 space-y-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div class="flex items-center gap-4">
			<a href="/admin/stores/{store.id}" class="p-2 rounded-lg hover:bg-muted">
				<ArrowLeft class="h-5 w-5" />
			</a>
			<div>
				<h1 class="text-2xl font-bold">Laporan</h1>
				<p class="text-muted-foreground">{store.name}</p>
			</div>
		</div>
	</div>

	<!-- Report Type Selector -->
	<div class="flex gap-2">
		<a
			href="?type=weekly&offset=0"
			class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm {reportType === 'weekly'
				? 'bg-primary text-primary-foreground'
				: 'bg-muted hover:bg-muted/80'}"
		>
			<Calendar class="h-4 w-4" />
			Mingguan
		</a>
		<a
			href="?type=monthly&offset=0"
			class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm {reportType === 'monthly'
				? 'bg-primary text-primary-foreground'
				: 'bg-muted hover:bg-muted/80'}"
		>
			<Calendar class="h-4 w-4" />
			Bulanan
		</a>
	</div>

	<!-- Period Navigation -->
	<div class="flex items-center justify-between">
		<a
			href="?type={reportType}&offset={offset + 1}"
			class="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-sm"
		>
			<ChevronLeft class="h-4 w-4" />
			Sebelumnya
		</a>
		<div class="text-center">
			<p class="font-medium">
				{report.period.startDate} - {report.period.endDate}
			</p>
			<p class="text-sm text-muted-foreground">
				{reportType === 'weekly' ? 'Minggu' : 'Bulan'}
				{offset === 0 ? 'Ini' : offset === 1 ? 'Lalu' : `${offset} lalu`}
			</p>
		</div>
		{#if offset > 0}
			<a
				href="?type={reportType}&offset={offset - 1}"
				class="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-sm"
			>
				Berikutnya
				<ChevronRight class="h-4 w-4" />
			</a>
		{:else}
			<span class="px-3 py-1.5 text-sm text-muted-foreground">Terkini</span>
		{/if}
	</div>

	<!-- Report Card -->
	<Card class="bg-gradient-to-br from-primary/5 to-primary/10">
		<div class="flex items-center justify-between mb-4">
			<h3 class="font-semibold flex items-center gap-2">
				<FileText class="h-5 w-5" />
				Rekap {reportType === 'weekly' ? 'Mingguan' : 'Bulanan'}
			</h3>
			<span class="px-2 py-1 text-xs rounded-full bg-primary/20 text-primary">
				{store.name}
			</span>
		</div>
		<p class="text-sm text-muted-foreground mb-6">
			Periode: {report.period.startDate} s/d {report.period.endDate}
		</p>

		<!-- Summary Stats -->
		<div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
			<div class="p-4 rounded-lg bg-background">
				<p class="text-sm text-muted-foreground">Total Transaksi</p>
				<p class="text-2xl font-bold">{report.summary.totalTransactions}</p>
			</div>
			<div class="p-4 rounded-lg bg-background">
				<p class="text-sm text-muted-foreground">Selesai</p>
				<p class="text-2xl font-bold text-green-500">
					{report.summary.completedTransactions}
				</p>
			</div>
			<div class="p-4 rounded-lg bg-background">
				<p class="text-sm text-muted-foreground">Dibatalkan</p>
				<p class="text-2xl font-bold text-red-500">
					{report.summary.cancelledTransactions}
				</p>
			</div>
			<div class="p-4 rounded-lg bg-background">
				<p class="text-sm text-muted-foreground">Rata-rata/Hari</p>
				<p class="text-lg font-bold">
					{formatCurrency(report.summary.averageDailyRevenue)}
				</p>
			</div>
		</div>

		<!-- Total Revenue -->
		<div class="p-6 rounded-lg bg-green-500/10 border border-green-500/20 text-center mb-6">
			<p class="text-sm text-muted-foreground mb-1">Total Pendapatan</p>
			<p class="text-3xl font-bold text-green-500">
				{formatCurrency(report.summary.totalRevenue)}
			</p>
		</div>

		<!-- Top Suppliers -->
		{#if report.topSuppliers.length > 0}
			<div class="mb-6">
				<h4 class="font-semibold mb-3 flex items-center gap-2">
					<Users class="h-4 w-4" />
					Top Supplier
				</h4>
				<div class="space-y-2">
					{#each report.topSuppliers as supplier, i}
						<div class="flex items-center justify-between p-3 rounded-lg bg-background">
							<div class="flex items-center gap-3">
								<span
									class="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium"
								>
									{i + 1}
								</span>
								<span class="font-medium">{supplier.name}</span>
							</div>
							<div class="text-right">
								<p class="font-medium">{formatCurrency(supplier.revenue)}</p>
								<p class="text-xs text-muted-foreground">
									{supplier.transactions} trx
								</p>
							</div>
						</div>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Export -->
		<div class="flex justify-end gap-2 print:hidden">
			<Button variant="outline" onclick={() => window.print()}>
				<Printer class="h-4 w-4 mr-2" />
				Print PDF
			</Button>
			<form method="POST" action="?/exportCSV">
				<Button type="submit" variant="outline">
					<Download class="h-4 w-4 mr-2" />
					Export CSV
				</Button>
			</form>
		</div>
	</Card>

	<!-- Generated At -->
	<p class="text-sm text-muted-foreground text-center">
		Laporan dibuat: {new Date(report.generatedAt).toLocaleString('id-ID')}
	</p>
</div>
