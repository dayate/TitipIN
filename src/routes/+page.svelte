<script lang="ts">
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import { Button } from '$lib/components/ui';
	import {
		Store,
		Users,
		BarChart3,
		Shield,
		Smartphone,
		Clock,
		ArrowRight,
		CheckCircle2,
		Menu,
		X
	} from 'lucide-svelte';

	let { data } = $props();
	let mobileMenuOpen = $state(false);

	const features = [
		{
			icon: Store,
			title: 'Multi-Lapak',
			description: 'Kelola banyak lapak dalam satu platform terpadu'
		},
		{
			icon: Users,
			title: 'Kelola Penyetor',
			description: 'Approve, suspend, atau kelola seluruh penyetor dengan mudah'
		},
		{
			icon: BarChart3,
			title: 'Laporan Real-time',
			description: 'Pantau transaksi dan pendapatan secara real-time'
		},
		{
			icon: Shield,
			title: 'Aman & Terpercaya',
			description: 'Data terenkripsi dan backup otomatis setiap hari'
		},
		{
			icon: Smartphone,
			title: 'Mobile Friendly',
			description: 'Akses dari HP kapanpun dan dimanapun'
		},
		{
			icon: Clock,
			title: 'Zona Waktu',
			description: 'Fitur zona malam-subuh-pagi untuk alur konsinyasi'
		}
	];

	const benefits = [
		'Tidak perlu antre panjang saat subuh',
		'Transparansi data stok dan penjualan',
		'Notifikasi WhatsApp otomatis',
		'Laporan keuangan lengkap',
		'Gratis untuk penyetor',
		'Support 24/7'
	];
</script>

<svelte:head>
	<title>Mak Unyil - Platform Konsinyasi Digital Multi-Lapak</title>
</svelte:head>

<div class="min-h-screen bg-background">
	<!-- Navigation -->
	<nav class="fixed left-0 right-0 top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
		<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<div class="flex h-16 items-center justify-between">
				<!-- Logo -->
				<div class="flex items-center gap-2">
					<div class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
						<Store class="h-6 w-6 text-primary-foreground" />
					</div>
					<span class="text-xl font-bold text-foreground">Mak Unyil</span>
				</div>

				<!-- Desktop Navigation -->
				<div class="hidden items-center gap-6 md:flex">
					<a href="#fitur" class="text-muted-foreground transition-colors hover:text-foreground">
						Fitur
					</a>
					<a href="#manfaat" class="text-muted-foreground transition-colors hover:text-foreground">
						Manfaat
					</a>
					<ThemeToggle />
					{#if data.user}
						<Button href={data.user.role === 'owner' ? '/admin' : '/app'}>
							Dashboard
						</Button>
					{:else}
						<a href="/auth/login" class="text-muted-foreground transition-colors hover:text-foreground">
							Masuk
						</a>
						<Button href="/auth/register">
							Daftar Gratis
						</Button>
					{/if}
				</div>

				<!-- Mobile Menu Button -->
				<div class="flex items-center gap-2 md:hidden">
					<ThemeToggle />
					<button
						onclick={() => (mobileMenuOpen = !mobileMenuOpen)}
						class="flex h-10 w-10 items-center justify-center rounded-lg text-foreground"
					>
						{#if mobileMenuOpen}
							<X class="h-6 w-6" />
						{:else}
							<Menu class="h-6 w-6" />
						{/if}
					</button>
				</div>
			</div>

			<!-- Mobile Menu -->
			{#if mobileMenuOpen}
				<div class="border-t border-border py-4 md:hidden">
					<div class="flex flex-col gap-4">
						<a href="#fitur" class="text-muted-foreground">Fitur</a>
						<a href="#manfaat" class="text-muted-foreground">Manfaat</a>
						{#if data.user}
							<Button href={data.user.role === 'owner' ? '/admin' : '/app'} class="w-full">
								Dashboard
							</Button>
						{:else}
							<a href="/auth/login" class="text-muted-foreground">Masuk</a>
							<Button href="/auth/register" class="w-full">
								Daftar Gratis
							</Button>
						{/if}
					</div>
				</div>
			{/if}
		</div>
	</nav>

	<!-- Hero Section -->
	<section class="relative overflow-hidden pt-32 pb-20">
		<!-- Background Gradient -->
		<div class="absolute inset-0 -z-10">
			<div class="absolute inset-0 bg-gradient-to-br from-primary-100 via-background to-accent-50 dark:from-primary-950 dark:via-background dark:to-accent-50/10"></div>
			<div class="absolute right-0 top-20 h-[500px] w-[500px] rounded-full bg-primary-200/30 blur-3xl dark:bg-primary-900/20"></div>
			<div class="absolute -left-20 bottom-0 h-[400px] w-[400px] rounded-full bg-accent-200/30 blur-3xl dark:bg-accent-900/20"></div>
		</div>

		<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<div class="text-center">
				<div class="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm text-primary">
					<span class="relative flex h-2 w-2">
						<span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
						<span class="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
					</span>
					Platform Konsinyasi Digital #1 di Indonesia
				</div>

				<h1 class="mb-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
					Kelola Bisnis Konsinyasi
					<span class="block bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
						Tanpa Ribet
					</span>
				</h1>

				<p class="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground">
					Serahkan pencatatan manual kepada sistem digital. Penyetor input sendiri,
					validasi otomatis, laporan lengkap. Semua dalam satu platform.
				</p>

				<div class="flex flex-col items-center justify-center gap-4 sm:flex-row">
					<Button size="lg" href="/auth/register" class="gap-2">
						Mulai Sekarang
						<ArrowRight class="h-5 w-5" />
					</Button>
					<Button size="lg" variant="outline" href="#fitur">
						Lihat Fitur
					</Button>
				</div>

				<!-- Stats -->
				<div class="mt-16 grid grid-cols-2 gap-8 sm:grid-cols-4">
					<div>
						<div class="text-3xl font-bold text-primary">100+</div>
						<div class="text-sm text-muted-foreground">Lapak Aktif</div>
					</div>
					<div>
						<div class="text-3xl font-bold text-primary">1,000+</div>
						<div class="text-sm text-muted-foreground">Penyetor</div>
					</div>
					<div>
						<div class="text-3xl font-bold text-primary">50K+</div>
						<div class="text-sm text-muted-foreground">Transaksi/Bulan</div>
					</div>
					<div>
						<div class="text-3xl font-bold text-primary">99.9%</div>
						<div class="text-sm text-muted-foreground">Uptime</div>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Features Section -->
	<section id="fitur" class="bg-muted/50 py-20">
		<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<div class="mb-12 text-center">
				<h2 class="mb-4 text-3xl font-bold text-foreground">Fitur Lengkap untuk Bisnis Anda</h2>
				<p class="mx-auto max-w-2xl text-muted-foreground">
					Semua yang Anda butuhkan untuk mengelola bisnis konsinyasi dengan efisien
				</p>
			</div>

			<div class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
				{#each features as feature}
					<div class="group rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg">
						<div class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
							<feature.icon class="h-6 w-6" />
						</div>
						<h3 class="mb-2 text-lg font-semibold text-foreground">{feature.title}</h3>
						<p class="text-muted-foreground">{feature.description}</p>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- Benefits Section -->
	<section id="manfaat" class="py-20">
		<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<div class="grid items-center gap-12 lg:grid-cols-2">
				<div>
					<h2 class="mb-4 text-3xl font-bold text-foreground">
						Kenapa Pilih Mak Unyil?
					</h2>
					<p class="mb-8 text-muted-foreground">
						Platform yang dirancang khusus untuk bisnis konsinyasi tradisional Indonesia.
						Mudah digunakan, bahkan untuk yang tidak tech-savvy.
					</p>

					<ul class="space-y-4">
						{#each benefits as benefit}
							<li class="flex items-center gap-3">
								<CheckCircle2 class="h-5 w-5 flex-shrink-0 text-primary" />
								<span class="text-foreground">{benefit}</span>
							</li>
						{/each}
					</ul>

					<div class="mt-8">
						<Button size="lg" href="/auth/register" class="gap-2">
							Daftar Sebagai Pemilik Lapak
							<ArrowRight class="h-5 w-5" />
						</Button>
					</div>
				</div>

				<!-- Illustration/Card -->
				<div class="relative">
					<div class="rounded-2xl border border-border bg-card p-8 shadow-xl">
						<div class="mb-6 flex items-center gap-4">
							<div class="flex h-14 w-14 items-center justify-center rounded-xl bg-primary">
								<Store class="h-8 w-8 text-primary-foreground" />
							</div>
							<div>
								<h3 class="font-semibold text-foreground">Lapak Ibu Siti</h3>
								<p class="text-sm text-muted-foreground">Pasar Tradisional ABC</p>
							</div>
						</div>

						<div class="space-y-4">
							<div class="flex items-center justify-between rounded-lg bg-muted p-3">
								<span class="text-sm text-muted-foreground">Penyetor Aktif</span>
								<span class="font-semibold text-foreground">24 orang</span>
							</div>
							<div class="flex items-center justify-between rounded-lg bg-muted p-3">
								<span class="text-sm text-muted-foreground">Transaksi Hari Ini</span>
								<span class="font-semibold text-foreground">156 item</span>
							</div>
							<div class="flex items-center justify-between rounded-lg bg-primary/10 p-3">
								<span class="text-sm text-primary">Pendapatan Bulan Ini</span>
								<span class="font-semibold text-primary">Rp 12.450.000</span>
							</div>
						</div>
					</div>

					<!-- Decorative elements -->
					<div class="absolute -right-4 -top-4 -z-10 h-full w-full rounded-2xl bg-primary/10"></div>
				</div>
			</div>
		</div>
	</section>

	<!-- CTA Section -->
	<section class="bg-primary py-20">
		<div class="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
			<h2 class="mb-4 text-3xl font-bold text-primary-foreground">
				Siap Mengubah Cara Anda Berbisnis?
			</h2>
			<p class="mb-8 text-primary-foreground/80">
				Bergabunglah dengan ratusan pemilik lapak yang sudah merasakan kemudahan Mak Unyil
			</p>
			<div class="flex flex-col items-center justify-center gap-4 sm:flex-row">
				<Button size="lg" variant="secondary" href="/auth/register" class="gap-2">
					Daftar Gratis Sekarang
					<ArrowRight class="h-5 w-5" />
				</Button>
				<Button size="lg" variant="outline" href="/auth/login" class="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
					Sudah Punya Akun? Masuk
				</Button>
			</div>
		</div>
	</section>

	<!-- Footer -->
	<footer class="border-t border-border bg-card py-12">
		<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<div class="flex flex-col items-center justify-between gap-6 md:flex-row">
				<div class="flex items-center gap-2">
					<div class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
						<Store class="h-6 w-6 text-primary-foreground" />
					</div>
					<span class="text-xl font-bold text-foreground">Mak Unyil</span>
				</div>

				<p class="text-sm text-muted-foreground">
					© 2024 Mak Unyil. Platform Konsinyasi Digital Multi-Lapak.
				</p>
			</div>
		</div>
	</footer>
</div>
