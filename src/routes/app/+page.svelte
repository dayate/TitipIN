<script lang="ts">
	import { Card } from '$lib/components/ui';
	import { Store, ArrowRight, History, Bell, Search } from 'lucide-svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>Dashboard - Mak Unyil</title>
</svelte:head>

<div class="space-y-6">
	<!-- Header -->
	<div
		class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-background p-6"
	>
		<div class="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/10 blur-2xl"></div>
		<div class="flex items-center gap-4">
			<div
				class="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/20 backdrop-blur-sm"
			>
				<Store class="h-7 w-7 text-primary" />
			</div>
			<div>
				<h1 class="text-2xl font-bold text-foreground">
					Selamat Datang, {data.user?.name || 'Penyetor'}! 👋
				</h1>
				<p class="text-muted-foreground">Pilih lapak untuk mulai berjualan</p>
			</div>
		</div>
	</div>

	<!-- Quick Actions -->
	<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
		<Card class="group hover:border-primary/50 transition-all cursor-pointer">
			<a href="/app/stores" class="block">
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-4">
						<div class="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
							<Store class="h-6 w-6 text-primary" />
						</div>
						<div>
							<h3 class="font-semibold text-foreground">Lapak Saya</h3>
							<p class="text-sm text-muted-foreground">Kelola lapak yang Anda ikuti</p>
						</div>
					</div>
					<ArrowRight
						class="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors"
					/>
				</div>
			</a>
		</Card>

		<Card class="group hover:border-primary/50 transition-all cursor-pointer">
			<a href="/app/discover" class="block">
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-4">
						<div class="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/10">
							<Search class="h-6 w-6 text-green-600 dark:text-green-400" />
						</div>
						<div>
							<h3 class="font-semibold text-foreground">Temukan Lapak</h3>
							<p class="text-sm text-muted-foreground">Cari & gabung lapak baru</p>
						</div>
					</div>
					<ArrowRight
						class="h-5 w-5 text-muted-foreground group-hover:text-green-500 transition-colors"
					/>
				</div>
			</a>
		</Card>

		<Card class="group hover:border-primary/50 transition-all cursor-pointer">
			<a href="/app/history" class="block">
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-4">
						<div class="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10">
							<History class="h-6 w-6 text-blue-600 dark:text-blue-400" />
						</div>
						<div>
							<h3 class="font-semibold text-foreground">Riwayat</h3>
							<p class="text-sm text-muted-foreground">Lihat riwayat transaksi Anda</p>
						</div>
					</div>
					<ArrowRight
						class="h-5 w-5 text-muted-foreground group-hover:text-blue-500 transition-colors"
					/>
				</div>
			</a>
		</Card>
	</div>

	<!-- Info Section -->
	<div class="rounded-2xl border border-border bg-card p-6">
		<h2 class="text-lg font-semibold text-foreground mb-4">Cara Menggunakan</h2>
		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			<div class="flex gap-3">
				<div
					class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary"
				>
					1
				</div>
				<div>
					<p class="font-medium text-foreground">Cari atau Gabung Lapak</p>
					<p class="text-sm text-muted-foreground">
						Temukan lapak publik atau gunakan kode undangan
					</p>
				</div>
			</div>
			<div class="flex gap-3">
				<div
					class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary"
				>
					2
				</div>
				<div>
					<p class="font-medium text-foreground">Daftarkan Produk</p>
					<p class="text-sm text-muted-foreground">Tambahkan produk yang ingin Anda setorkan</p>
				</div>
			</div>
			<div class="flex gap-3">
				<div
					class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary"
				>
					3
				</div>
				<div>
					<p class="font-medium text-foreground">Mulai Setor</p>
					<p class="text-sm text-muted-foreground">Input setoran harian dan pantau penjualan</p>
				</div>
			</div>
		</div>
	</div>
</div>
