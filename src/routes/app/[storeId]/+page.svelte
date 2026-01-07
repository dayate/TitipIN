<script lang="ts">
	import { Card, Button } from '$lib/components/ui';
	import SetoranModal from '$lib/components/SetoranModal.svelte';
	import {
		Store,
		Package,
		History,
		ShoppingBag,
		TrendingUp,
		DollarSign,
		ArrowLeft
	} from 'lucide-svelte';

	let { data } = $props();
	let setoranModalOpen = $state(false);

	function formatCurrency(value: number) {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0
		}).format(value);
	}
</script>

<svelte:head>
	<title>{data.store.name} - Mak Unyil</title>
</svelte:head>

<div class="mx-auto max-w-4xl space-y-6">
	<!-- Header -->
	<div class="flex items-start justify-between">
		<div>
			<a
				href="/app/stores"
				class="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
			>
				<ArrowLeft class="h-4 w-4" />
				Kembali ke Daftar Lapak
			</a>
			<div class="mt-4 flex items-center gap-4">
				<div
					class="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/70 shadow-lg"
				>
					<Store class="h-8 w-8 text-primary-foreground" />
				</div>
				<div>
					<h1 class="text-2xl font-bold text-foreground">{data.store.name}</h1>
					<p class="text-muted-foreground">{data.store.description || 'Lapak Saya'}</p>
				</div>
			</div>
		</div>
		<span
			class="rounded-full px-4 py-1.5 text-sm font-medium shadow-sm {data.store.isOpen
				? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
				: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}"
		>
			{data.store.isOpen ? '🟢 Buka' : '🔴 Tutup'}
		</span>
	</div>

	<!-- Stats Cards -->
	<div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
		<Card class="border-primary/20">
			<div class="flex items-center gap-3">
				<div class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
					<Package class="h-5 w-5 text-primary" />
				</div>
				<div>
					<p class="text-2xl font-bold text-foreground">{data.counts.total}</p>
					<p class="text-xs text-muted-foreground">Produk</p>
				</div>
			</div>
		</Card>
		<Card class="border-primary/20">
			<div class="flex items-center gap-3">
				<div class="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/10">
					<Package class="h-5 w-5 text-green-500" />
				</div>
				<div>
					<p class="text-2xl font-bold text-foreground">{data.counts.approved}</p>
					<p class="text-xs text-muted-foreground">Disetujui</p>
				</div>
			</div>
		</Card>
		<Card class="border-primary/20">
			<div class="flex items-center gap-3">
				<div class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
					<TrendingUp class="h-5 w-5 text-primary" />
				</div>
				<div>
					<p class="text-2xl font-bold text-foreground">{data.transactionCount}</p>
					<p class="text-xs text-muted-foreground">Setoran</p>
				</div>
			</div>
		</Card>
		<Card class="border-primary/20">
			<div class="flex items-center gap-3">
				<div class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
					<DollarSign class="h-5 w-5 text-primary" />
				</div>
				<div>
					<p class="text-lg font-bold text-foreground">{formatCurrency(data.totalEarnings)}</p>
					<p class="text-xs text-muted-foreground">Pendapatan</p>
				</div>
			</div>
		</Card>
	</div>

	<!-- Main Actions -->
	<Card>
		<h3 class="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
			Kelola Setoran
		</h3>
		<div class="grid grid-cols-3 gap-2">
			<Button
				onclick={() => (setoranModalOpen = true)}
				variant="outline"
				class="h-auto flex-col gap-1.5 py-4 text-xs hover:border-primary hover:bg-primary/5"
				disabled={!data.store.isOpen}
			>
				<ShoppingBag class="h-6 w-6 text-primary" />
				<span>Input Setoran</span>
			</Button>
			<Button
				href="/app/{data.store.id}/products"
				variant="outline"
				class="h-auto flex-col gap-1.5 py-4 text-xs hover:border-primary hover:bg-primary/5"
			>
				<Package class="h-6 w-6 text-primary" />
				<span>Kelola Produk</span>
			</Button>
			<Button
				href="/app/{data.store.id}/history"
				variant="outline"
				class="h-auto flex-col gap-1.5 py-4 text-xs hover:border-primary hover:bg-primary/5"
			>
				<History class="h-6 w-6 text-primary" />
				<span>Riwayat</span>
			</Button>
		</div>
	</Card>

	<!-- Pending Products Notice -->
	{#if data.counts.pending > 0}
		<Card class="border-yellow-500/30 bg-yellow-500/5">
			<div class="flex items-center gap-4">
				<div class="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-500/10">
					<Package class="h-6 w-6 text-yellow-600" />
				</div>
				<div class="flex-1">
					<p class="font-semibold text-foreground">
						{data.counts.pending} Produk Menunggu Approval
					</p>
					<p class="text-sm text-muted-foreground">Admin sedang mereview produk Anda</p>
				</div>
				<Button href="/app/{data.store.id}/products" variant="outline">Lihat</Button>
			</div>
		</Card>
	{/if}

	<!-- Rejected Products Notice -->
	{#if data.counts.rejected > 0}
		<Card class="border-red-500/30 bg-red-500/5">
			<div class="flex items-center gap-4">
				<div class="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10">
					<Package class="h-6 w-6 text-red-600" />
				</div>
				<div class="flex-1">
					<p class="font-semibold text-foreground">{data.counts.rejected} Produk Ditolak</p>
					<p class="text-sm text-muted-foreground">
						Silakan perbarui atau hapus produk yang ditolak
					</p>
				</div>
				<Button href="/app/{data.store.id}/products" variant="outline">Perbarui</Button>
			</div>
		</Card>
	{/if}
</div>

<!-- Setoran Modal -->
<SetoranModal
	bind:open={setoranModalOpen}
	storeId={data.store.id}
	storeName={data.store.name}
	date={data.setoranDate}
	products={data.approvedProducts}
	onClose={() => (setoranModalOpen = false)}
/>
