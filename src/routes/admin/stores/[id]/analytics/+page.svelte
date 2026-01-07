<script lang="ts">
	import { formatCurrency, formatDate } from '$lib/utils';
	import { Card, Button } from '$lib/components/ui';
	import {
		TrendingUp,
		Users,
		Package,
		DollarSign,
		Calendar,
		ArrowLeft,
		BarChart3
	} from 'lucide-svelte';

	export let data;

	$: store = data.store;
	$: dashboard = data.dashboardData;
	$: revenueData = data.revenueData;
	$: period = data.period;

	function getBadgeClass(score: number): string {
		if (score >= 80) return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
		if (score >= 50)
			return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
		return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
	}
</script>

<svelte:head>
	<title>Analytics - {store.name}</title>
</svelte:head>

<div class="container max-w-6xl mx-auto p-4 space-y-6">
	<!-- Header -->
	<div class="flex items-center justify-between flex-wrap gap-4">
		<div class="flex items-center gap-4">
			<a href="/admin/stores/{store.id}" class="p-2 rounded-lg hover:bg-muted">
				<ArrowLeft class="h-5 w-5" />
			</a>
			<div>
				<h1 class="text-2xl font-bold">Analytics</h1>
				<p class="text-muted-foreground">{store.name}</p>
			</div>
		</div>

		<!-- Period Selector -->
		<div class="flex gap-2">
			<a
				href="?period=7"
				class="px-3 py-1.5 rounded-lg text-sm {period === 7
					? 'bg-primary text-primary-foreground'
					: 'bg-muted hover:bg-muted/80'}"
			>
				7 Hari
			</a>
			<a
				href="?period=30"
				class="px-3 py-1.5 rounded-lg text-sm {period === 30
					? 'bg-primary text-primary-foreground'
					: 'bg-muted hover:bg-muted/80'}"
			>
				30 Hari
			</a>
			<a
				href="?period=90"
				class="px-3 py-1.5 rounded-lg text-sm {period === 90
					? 'bg-primary text-primary-foreground'
					: 'bg-muted hover:bg-muted/80'}"
			>
				90 Hari
			</a>
		</div>
	</div>

	<!-- Stats Cards -->
	<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
		<Card class="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
			<div class="flex items-center gap-3">
				<div class="p-2 rounded-lg bg-green-500/20">
					<DollarSign class="h-5 w-5 text-green-500" />
				</div>
				<div>
					<p class="text-sm text-muted-foreground">Total Pendapatan</p>
					<p class="text-xl font-bold">
						{formatCurrency(dashboard.totalRevenue)}
					</p>
				</div>
			</div>
		</Card>

		<Card class="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
			<div class="flex items-center gap-3">
				<div class="p-2 rounded-lg bg-blue-500/20">
					<TrendingUp class="h-5 w-5 text-blue-500" />
				</div>
				<div>
					<p class="text-sm text-muted-foreground">Transaksi</p>
					<p class="text-xl font-bold">{dashboard.totalTransactions}</p>
				</div>
			</div>
		</Card>

		<Card class="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
			<div class="flex items-center gap-3">
				<div class="p-2 rounded-lg bg-purple-500/20">
					<Users class="h-5 w-5 text-purple-500" />
				</div>
				<div>
					<p class="text-sm text-muted-foreground">Supplier Aktif</p>
					<p class="text-xl font-bold">{dashboard.totalSuppliers}</p>
				</div>
			</div>
		</Card>

		<Card class="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20">
			<div class="flex items-center gap-3">
				<div class="p-2 rounded-lg bg-orange-500/20">
					<Package class="h-5 w-5 text-orange-500" />
				</div>
				<div>
					<p class="text-sm text-muted-foreground">Produk</p>
					<p class="text-xl font-bold">{dashboard.totalProducts}</p>
				</div>
			</div>
		</Card>
	</div>

	<!-- Revenue Chart -->
	<Card>
		<h3 class="font-semibold mb-4 flex items-center gap-2">
			<BarChart3 class="h-5 w-5" />
			Pendapatan per Hari
		</h3>
		{#if revenueData.length > 0}
			<div class="h-48 flex items-end gap-1">
				{#each revenueData as day}
					{@const maxRevenue = Math.max(...revenueData.map((d) => d.revenue))}
					{@const height = maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0}
					<div class="flex-1 flex flex-col items-center gap-1">
						<div
							class="w-full bg-primary/80 rounded-t transition-all hover:bg-primary cursor-pointer"
							style="height: {Math.max(height, 2)}%"
							title="{day.date}: {formatCurrency(day.revenue)}"
						></div>
					</div>
				{/each}
			</div>
		{:else}
			<div class="h-48 flex items-center justify-center text-muted-foreground">
				Belum ada data pendapatan
			</div>
		{/if}
	</Card>

	<!-- Top Suppliers & Recent Transactions -->
	<div class="grid md:grid-cols-2 gap-6">
		<!-- Top Suppliers -->
		<Card>
			<h3 class="font-semibold mb-4">Top Supplier</h3>
			{#if dashboard.topSuppliers.length > 0}
				<div class="space-y-3">
					{#each dashboard.topSuppliers as supplier, i}
						<div class="flex items-center justify-between p-2 rounded-lg bg-muted/50">
							<div class="flex items-center gap-3">
								<span
									class="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium"
								>
									{i + 1}
								</span>
								<div>
									<p class="font-medium">{supplier.supplierName}</p>
									<p class="text-sm text-muted-foreground">
										{supplier.transactionCount} transaksi
									</p>
								</div>
							</div>
							<div class="text-right">
								<p class="font-medium">
									{formatCurrency(supplier.totalRevenue)}
								</p>
								<span
									class="text-xs px-2 py-0.5 rounded-full {getBadgeClass(
										supplier.reliabilityScore
									)}"
								>
									{supplier.reliabilityScore}%
								</span>
							</div>
						</div>
					{/each}
				</div>
			{:else}
				<p class="text-muted-foreground text-center py-8">Belum ada data supplier</p>
			{/if}
		</Card>

		<!-- Recent Transactions -->
		<Card>
			<h3 class="font-semibold mb-4">Transaksi Terbaru</h3>
			{#if dashboard.recentTransactions.length > 0}
				<div class="space-y-2">
					{#each dashboard.recentTransactions as trx}
						<div class="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
							<div>
								<p class="font-medium">{trx.supplierName}</p>
								<p class="text-sm text-muted-foreground">{trx.date}</p>
							</div>
							<div class="text-right">
								<p class="font-medium">{formatCurrency(trx.totalPayout)}</p>
								<span
									class="text-xs px-2 py-0.5 rounded-full {trx.status === 'completed'
										? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
										: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'}"
								>
									{trx.status}
								</span>
							</div>
						</div>
					{/each}
				</div>
			{:else}
				<p class="text-muted-foreground text-center py-8">Belum ada transaksi</p>
			{/if}
		</Card>
	</div>

	<!-- Quick Links -->
	<div class="flex gap-4 flex-wrap">
		<Button href="/admin/stores/{store.id}/reliability" variant="outline">
			Lihat Reliability Supplier
		</Button>
		<Button href="/admin/stores/{store.id}/reports" variant="outline">Generate Laporan</Button>
	</div>
</div>
