<script lang="ts">
	import { Card, Button } from '$lib/components/ui';
	import { formatCurrency } from '$lib/utils';
	import {
		Package,
		TrendingUp,
		Clock,
		CheckCircle2,
		AlertCircle,
		ArrowRight,
		Store
	} from 'lucide-svelte';

	let { data } = $props();

	// Sample data (in real app, from database)
	const quickStats = [
		{ label: 'Produk Terdaftar', value: '12', icon: Package },
		{ label: 'Setoran Bulan Ini', value: '45', icon: TrendingUp },
		{ label: 'Pendapatan', value: formatCurrency(2450000), icon: TrendingUp }
	];

	const recentTransactions = [
		{ product: 'Kue Lapis', qty: 10, status: 'completed', date: 'Hari ini' },
		{ product: 'Roti Manis', qty: 15, status: 'verified', date: 'Kemarin' },
		{ product: 'Brownies', qty: 8, status: 'draft', date: '2 hari lalu' }
	];

	const myStores = [
		{ name: 'Lapak Ibu Siti', status: 'active', memberSince: '3 bulan' },
		{ name: 'Toko Pak Ahmad', status: 'active', memberSince: '1 bulan' }
	];
</script>

<svelte:head>
	<title>Beranda - Mak Unyil</title>
</svelte:head>

<div class="space-y-6">
	<!-- Welcome -->
	<div>
		<h1 class="text-2xl font-bold text-foreground">
			Halo, {data.user.name}! 👋
		</h1>
		<p class="text-muted-foreground">
			Apa yang ingin Anda lakukan hari ini?
		</p>
	</div>

	<!-- Quick Actions -->
	<div class="grid gap-4 sm:grid-cols-2">
		<Button size="lg" href="/app/setor" class="h-auto flex-col gap-2 py-6">
			<Package class="h-8 w-8" />
			<span class="text-lg">Setor Produk</span>
			<span class="text-sm opacity-80">Input setoran baru</span>
		</Button>
		<Button size="lg" variant="outline" href="/app/history" class="h-auto flex-col gap-2 py-6">
			<Clock class="h-8 w-8" />
			<span class="text-lg">Lihat Riwayat</span>
			<span class="text-sm opacity-80">Cek transaksi Anda</span>
		</Button>
	</div>

	<!-- Quick Stats -->
	<div class="grid gap-4 sm:grid-cols-3">
		{#each quickStats as stat}
			<Card class="flex items-center gap-4">
				<div class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10">
					<stat.icon class="h-6 w-6 text-primary" />
				</div>
				<div>
					<p class="text-sm text-muted-foreground">{stat.label}</p>
					<p class="text-xl font-bold text-foreground">{stat.value}</p>
				</div>
			</Card>
		{/each}
	</div>

	<div class="grid gap-6 lg:grid-cols-2">
		<!-- Recent Transactions -->
		<Card>
			<div class="mb-4 flex items-center justify-between">
				<h2 class="text-lg font-semibold text-foreground">Transaksi Terbaru</h2>
				<a href="/app/history" class="flex items-center gap-1 text-sm text-primary hover:underline">
					Lihat Semua
					<ArrowRight class="h-4 w-4" />
				</a>
			</div>
			<div class="space-y-3">
				{#each recentTransactions as trx}
					<div class="flex items-center justify-between rounded-lg bg-muted p-3">
						<div class="flex items-center gap-3">
							<div class="flex h-10 w-10 items-center justify-center rounded-lg
								{trx.status === 'completed' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : ''}
								{trx.status === 'verified' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : ''}
								{trx.status === 'draft' ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400' : ''}
							">
								{#if trx.status === 'completed'}
									<CheckCircle2 class="h-5 w-5" />
								{:else if trx.status === 'verified'}
									<Clock class="h-5 w-5" />
								{:else}
									<AlertCircle class="h-5 w-5" />
								{/if}
							</div>
							<div>
								<p class="font-medium text-foreground">{trx.product}</p>
								<p class="text-sm text-muted-foreground">{trx.qty} item • {trx.date}</p>
							</div>
						</div>
						<span class="rounded-full px-2 py-1 text-xs font-medium
							{trx.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : ''}
							{trx.status === 'verified' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : ''}
							{trx.status === 'draft' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : ''}
						">
							{trx.status === 'completed' ? 'Selesai' : trx.status === 'verified' ? 'Divalidasi' : 'Draft'}
						</span>
					</div>
				{/each}
			</div>
		</Card>

		<!-- My Stores -->
		<Card>
			<div class="mb-4 flex items-center justify-between">
				<h2 class="text-lg font-semibold text-foreground">Lapak Saya</h2>
				<a href="/app/stores" class="flex items-center gap-1 text-sm text-primary hover:underline">
					Jelajahi Lapak
					<ArrowRight class="h-4 w-4" />
				</a>
			</div>
			<div class="space-y-3">
				{#each myStores as store}
					<div class="flex items-center gap-3 rounded-lg bg-muted p-3">
						<div class="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
							<Store class="h-6 w-6 text-primary" />
						</div>
						<div class="flex-1">
							<p class="font-medium text-foreground">{store.name}</p>
							<p class="text-sm text-muted-foreground">Anggota sejak {store.memberSince}</p>
						</div>
						<span class="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
							Aktif
						</span>
					</div>
				{/each}
			</div>
		</Card>
	</div>
</div>
