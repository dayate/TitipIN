<script lang="ts">
	import { formatCurrency, formatDate } from '$lib/utils';
	import { Card, Button } from '$lib/components/ui';
	import {
		ArrowLeft,
		Star,
		AlertTriangle,
		TrendingUp,
		CheckCircle,
		XCircle,
		Clock
	} from 'lucide-svelte';

	export let data;

	$: store = data.store;
	$: suppliers = data.supplierReliability;
	$: lowReliability = data.lowReliabilitySuppliers;

	function getScoreColor(score: number): string {
		if (score >= 80) return 'text-green-500';
		if (score >= 50) return 'text-yellow-500';
		return 'text-red-500';
	}

	function getScoreBg(score: number): string {
		if (score >= 80) return 'bg-green-500/10 border-green-500/20';
		if (score >= 50) return 'bg-yellow-500/10 border-yellow-500/20';
		return 'bg-red-500/10 border-red-500/20';
	}
</script>

<svelte:head>
	<title>Reliabilitas Supplier - {store.name}</title>
</svelte:head>

<div class="container max-w-6xl mx-auto p-4 space-y-6">
	<!-- Header -->
	<div class="flex items-center gap-4">
		<a href="/admin/stores/{store.id}" class="p-2 rounded-lg hover:bg-muted">
			<ArrowLeft class="h-5 w-5" />
		</a>
		<div>
			<h1 class="text-2xl font-bold">Reliabilitas Supplier</h1>
			<p class="text-muted-foreground">
				{store.name} - Data internal (tidak terlihat supplier)
			</p>
		</div>
	</div>

	<!-- Low Reliability Warning -->
	{#if lowReliability.length > 0}
		<div class="p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-3">
			<AlertTriangle class="h-5 w-5 text-red-500 mt-0.5" />
			<div>
				<p class="font-medium text-red-700 dark:text-red-400">Perhatian!</p>
				<p class="text-sm text-muted-foreground">
					Ada {lowReliability.length} supplier dengan reliabilitas rendah (&lt;50%):
					{lowReliability.map((s) => s.supplierName).join(', ')}
				</p>
			</div>
		</div>
	{/if}

	<!-- Legend -->
	<Card>
		<div class="flex flex-wrap gap-4 text-sm">
			<div class="flex items-center gap-2">
				<div class="w-3 h-3 rounded-full bg-green-500"></div>
				<span>Sangat Baik (80-100%)</span>
			</div>
			<div class="flex items-center gap-2">
				<div class="w-3 h-3 rounded-full bg-yellow-500"></div>
				<span>Perlu Perhatian (50-79%)</span>
			</div>
			<div class="flex items-center gap-2">
				<div class="w-3 h-3 rounded-full bg-red-500"></div>
				<span>Bermasalah (&lt;50%)</span>
			</div>
		</div>
	</Card>

	<!-- Supplier List -->
	{#if suppliers.length > 0}
		<div class="space-y-4">
			{#each suppliers as supplier}
				<Card class={getScoreBg(supplier.reliabilityScore)}>
					<div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
						<!-- Supplier Info -->
						<div class="flex items-center gap-4">
							<div
								class="w-12 h-12 rounded-full bg-background flex items-center justify-center text-xl font-bold {getScoreColor(
									supplier.reliabilityScore
								)}"
							>
								{supplier.reliabilityScore}%
							</div>
							<div>
								<h3 class="font-semibold text-lg">{supplier.supplierName}</h3>
								<p class="text-sm text-muted-foreground">
									{supplier.totalTransactions} total transaksi
								</p>
							</div>
						</div>

						<!-- Stats -->
						<div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
							<div>
								<div class="flex items-center justify-center gap-1 text-green-500">
									<CheckCircle class="h-4 w-4" />
									<span class="font-semibold">{supplier.completedTransactions}</span>
								</div>
								<p class="text-xs text-muted-foreground">Selesai</p>
							</div>
							<div>
								<div class="flex items-center justify-center gap-1 text-red-500">
									<XCircle class="h-4 w-4" />
									<span class="font-semibold">{supplier.cancelledBySupplier}</span>
								</div>
								<p class="text-xs text-muted-foreground">Dibatalkan</p>
							</div>
							<div>
								<div class="flex items-center justify-center gap-1 text-yellow-500">
									<Clock class="h-4 w-4" />
									<span class="font-semibold">{supplier.noShowCount}</span>
								</div>
								<p class="text-xs text-muted-foreground">No-show</p>
							</div>
							<div>
								<div class="flex items-center justify-center gap-1">
									<TrendingUp class="h-4 w-4" />
									<span class="font-semibold">{supplier.averageAccuracy}%</span>
								</div>
								<p class="text-xs text-muted-foreground">Akurasi</p>
							</div>
						</div>

						<!-- Revenue -->
						<div class="text-right">
							<p class="text-lg font-bold">
								{formatCurrency(supplier.totalRevenue)}
							</p>
							<p class="text-sm text-muted-foreground">
								{supplier.totalSoldQty} item terjual
							</p>
						</div>
					</div>
				</Card>
			{/each}
		</div>
	{:else}
		<Card>
			<div class="py-8 text-center">
				<Star class="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
				<h3 class="text-lg font-medium">Belum ada data</h3>
				<p class="text-muted-foreground">Data reliabilitas akan muncul setelah transaksi selesai</p>
			</div>
		</Card>
	{/if}

	<!-- Info -->
	<Card class="bg-muted/50">
		<h4 class="font-medium mb-2">Cara Perhitungan Reliabilitas</h4>
		<ul class="text-sm text-muted-foreground space-y-1">
			<li>• <strong>Base Score:</strong> Persentase transaksi selesai</li>
			<li>• <strong>Penalti No-show:</strong> -10% per kejadian</li>
			<li>• <strong>Penalti Cancel:</strong> -5% per kejadian</li>
			<li>
				• <strong>Akurasi:</strong> Perbandingan qty_planned vs qty_actual
			</li>
		</ul>
	</Card>
</div>
