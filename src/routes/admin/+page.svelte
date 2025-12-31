<script lang="ts">
	import { Card } from '$lib/components/ui';
	import { formatCurrency } from '$lib/utils';
	import {
		Users,
		Package,
		TrendingUp,
		DollarSign,
		ArrowUpRight,
		ArrowDownRight,
		Clock,
		CheckCircle2,
		AlertCircle
	} from 'lucide-svelte';

	let { data } = $props();

	// Sample stats (in real app, these would come from database)
	const stats = [
		{
			label: 'Total Anggota',
			value: '24',
			change: '+3',
			changeType: 'positive',
			icon: Users
		},
		{
			label: 'Produk Aktif',
			value: '156',
			change: '+12',
			changeType: 'positive',
			icon: Package
		},
		{
			label: 'Transaksi Hari Ini',
			value: '42',
			change: '-5',
			changeType: 'negative',
			icon: TrendingUp
		},
		{
			label: 'Pendapatan Bulan Ini',
			value: formatCurrency(12450000),
			change: '+18%',
			changeType: 'positive',
			icon: DollarSign
		}
	];

	const recentActivities = [
		{ type: 'join', message: 'Ahmad Fauzi mengajukan bergabung', time: '5 menit lalu', status: 'pending' },
		{ type: 'transaction', message: 'Ibu Siti mengirim setoran 25 item', time: '30 menit lalu', status: 'success' },
		{ type: 'product', message: 'Produk "Kue Lapis" menunggu approval', time: '1 jam lalu', status: 'pending' },
		{ type: 'transaction', message: 'Pak Budi menyelesaikan retur', time: '2 jam lalu', status: 'success' },
		{ type: 'alert', message: 'Stok "Roti Manis" hampir habis', time: '3 jam lalu', status: 'warning' }
	];
</script>

<svelte:head>
	<title>Dashboard - Admin - Mak Unyil</title>
</svelte:head>

<div class="space-y-6">
	<!-- Welcome Header -->
	<div>
		<h1 class="text-2xl font-bold text-foreground">
			Selamat datang, {data.user.name}! 👋
		</h1>
		<p class="text-muted-foreground">
			Berikut ringkasan aktivitas lapak Anda hari ini
		</p>
	</div>

	<!-- Stats Grid -->
	<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
		{#each stats as stat}
			<Card class="flex items-start gap-4">
				<div class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10">
					<stat.icon class="h-6 w-6 text-primary" />
				</div>
				<div class="min-w-0 flex-1">
					<p class="text-sm text-muted-foreground">{stat.label}</p>
					<p class="text-xl font-bold text-foreground">{stat.value}</p>
					<div class="flex items-center gap-1 text-xs {stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}">
						{#if stat.changeType === 'positive'}
							<ArrowUpRight class="h-3 w-3" />
						{:else}
							<ArrowDownRight class="h-3 w-3" />
						{/if}
						<span>{stat.change}</span>
					</div>
				</div>
			</Card>
		{/each}
	</div>

	<!-- Main Content Grid -->
	<div class="grid gap-6 lg:grid-cols-3">
		<!-- Recent Activity -->
		<Card class="lg:col-span-2">
			<h2 class="mb-4 text-lg font-semibold text-foreground">Aktivitas Terbaru</h2>
			<div class="space-y-4">
				{#each recentActivities as activity}
					<div class="flex items-start gap-3">
						<div class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full
							{activity.status === 'pending' ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400' : ''}
							{activity.status === 'success' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : ''}
							{activity.status === 'warning' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' : ''}
						">
							{#if activity.status === 'pending'}
								<Clock class="h-4 w-4" />
							{:else if activity.status === 'success'}
								<CheckCircle2 class="h-4 w-4" />
							{:else}
								<AlertCircle class="h-4 w-4" />
							{/if}
						</div>
						<div class="min-w-0 flex-1">
							<p class="text-sm text-foreground">{activity.message}</p>
							<p class="text-xs text-muted-foreground">{activity.time}</p>
						</div>
					</div>
				{/each}
			</div>
		</Card>

		<!-- Quick Actions -->
		<Card>
			<h2 class="mb-4 text-lg font-semibold text-foreground">Aksi Cepat</h2>
			<div class="space-y-2">
				<a
					href="/admin/members"
					class="flex items-center gap-3 rounded-lg bg-muted p-3 transition-colors hover:bg-primary/10"
				>
					<Users class="h-5 w-5 text-primary" />
					<div>
						<p class="text-sm font-medium text-foreground">Kelola Anggota</p>
						<p class="text-xs text-muted-foreground">3 permintaan baru</p>
					</div>
				</a>
				<a
					href="/admin/products"
					class="flex items-center gap-3 rounded-lg bg-muted p-3 transition-colors hover:bg-primary/10"
				>
					<Package class="h-5 w-5 text-primary" />
					<div>
						<p class="text-sm font-medium text-foreground">Approve Produk</p>
						<p class="text-xs text-muted-foreground">5 menunggu</p>
					</div>
				</a>
				<a
					href="/admin/transactions"
					class="flex items-center gap-3 rounded-lg bg-muted p-3 transition-colors hover:bg-primary/10"
				>
					<TrendingUp class="h-5 w-5 text-primary" />
					<div>
						<p class="text-sm font-medium text-foreground">Validasi Setoran</p>
						<p class="text-xs text-muted-foreground">12 perlu validasi</p>
					</div>
				</a>
			</div>
		</Card>
	</div>
</div>
