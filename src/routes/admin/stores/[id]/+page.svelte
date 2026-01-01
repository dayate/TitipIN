<script lang="ts">
	import { Card, Button } from '$lib/components/ui';
	import { enhance } from '$app/forms';
	import {
		ArrowLeft,
		Store,
		Users,
		Package,
		ClipboardCheck,
		RotateCcw,
		History,
		Link,
		Power,
		Trash2,
		Settings,
		TrendingUp,
		DollarSign,
		ShoppingBag
	} from 'lucide-svelte';

	let { data, form } = $props();

	let showDeleteConfirm = $state(false);

	function formatCurrency(value: number) {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0
		}).format(value);
	}
</script>

<svelte:head>
	<title>{data.store.name} - Kelola Lapak - Mak Unyil</title>
</svelte:head>

<div class="mx-auto max-w-4xl space-y-6">
	<!-- Header -->
	<div class="flex items-start justify-between">
		<div>
			<a href="/admin/stores" class="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
				<ArrowLeft class="h-4 w-4" />
				Kembali ke Daftar Lapak
			</a>
			<div class="mt-4 flex items-center gap-4">
				<div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/70 shadow-lg">
					<Store class="h-8 w-8 text-primary-foreground" />
				</div>
				<div>
					<h1 class="text-2xl font-bold text-foreground">{data.store.name}</h1>
					<p class="text-muted-foreground">{data.store.description || 'Kelola lapak Anda'}</p>
				</div>
			</div>
		</div>
		<span class="rounded-full px-4 py-1.5 text-sm font-medium shadow-sm {data.store.isOpen ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}">
			{data.store.isOpen ? '🟢 Buka' : '🔴 Tutup'}
		</span>
	</div>

	<!-- Stats Cards -->
	<div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
		<Card class="border-primary/20">
			<div class="flex items-center gap-3">
				<div class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
					<Users class="h-5 w-5 text-primary" />
				</div>
				<div>
					<p class="text-2xl font-bold text-foreground">{data.store.memberCount}</p>
					<p class="text-xs text-muted-foreground">Anggota</p>
				</div>
			</div>
		</Card>
		<Card class="border-primary/20">
			<div class="flex items-center gap-3">
				<div class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
					<Package class="h-5 w-5 text-primary" />
				</div>
				<div>
					<p class="text-2xl font-bold text-foreground">{data.store.productCount || 0}</p>
					<p class="text-xs text-muted-foreground">Produk</p>
				</div>
			</div>
		</Card>
		<Card class="border-primary/20">
			<div class="flex items-center gap-3">
				<div class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
					<TrendingUp class="h-5 w-5 text-primary" />
				</div>
				<div>
					<p class="text-2xl font-bold text-foreground">{data.store.transactionCount || 0}</p>
					<p class="text-xs text-muted-foreground">Transaksi</p>
				</div>
			</div>
		</Card>
		<Card class="border-primary/20">
			<div class="flex items-center gap-3">
				<div class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
					<DollarSign class="h-5 w-5 text-primary" />
				</div>
				<div>
					<p class="text-lg font-bold text-foreground">{formatCurrency(data.store.totalRevenue || 0)}</p>
					<p class="text-xs text-muted-foreground">Pendapatan</p>
				</div>
			</div>
		</Card>
	</div>

	<!-- Main Actions -->
	<Card>
		<h3 class="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Kelola Setoran</h3>
		<div class="grid grid-cols-4 gap-2">
			<Button href="/admin/stores/{data.store.id}/validation" variant="outline" class="h-auto flex-col gap-1.5 py-3 text-xs hover:border-primary hover:bg-primary/5">
				<ClipboardCheck class="h-5 w-5 text-primary" />
				<span>Validasi</span>
			</Button>
			<Button href="/admin/stores/{data.store.id}/return" variant="outline" class="h-auto flex-col gap-1.5 py-3 text-xs hover:border-primary hover:bg-primary/5">
				<RotateCcw class="h-5 w-5 text-primary" />
				<span>Retur</span>
			</Button>
			<Button href="/admin/stores/{data.store.id}/history" variant="outline" class="h-auto flex-col gap-1.5 py-3 text-xs hover:border-primary hover:bg-primary/5">
				<History class="h-5 w-5 text-primary" />
				<span>Riwayat</span>
			</Button>
			<Button href="/admin/stores/{data.store.id}/products" variant="outline" class="h-auto flex-col gap-1.5 py-3 text-xs hover:border-primary hover:bg-primary/5">
				<Package class="h-5 w-5 text-primary" />
				<span>Produk</span>
			</Button>
		</div>
	</Card>

	<!-- Secondary Actions -->
	<Card>
		<h3 class="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Kelola Lapak</h3>
		<div class="grid grid-cols-4 gap-2">
			<Button href="/admin/stores/{data.store.id}/members" variant="outline" class="h-auto flex-col gap-1.5 py-3 text-xs">
				<Users class="h-5 w-5 text-muted-foreground" />
				<span>Anggota</span>
			</Button>
			<Button href="/admin/stores/{data.store.id}/invite" variant="outline" class="h-auto flex-col gap-1.5 py-3 text-xs">
				<Link class="h-5 w-5 text-muted-foreground" />
				<span>Undang</span>
			</Button>
			<Button href="/admin/stores/{data.store.id}/settings" variant="outline" class="h-auto flex-col gap-1.5 py-3 text-xs">
				<Settings class="h-5 w-5 text-muted-foreground" />
				<span>Pengaturan</span>
			</Button>
			<form method="POST" action="?/toggleStatus" use:enhance class="contents">
				<Button type="submit" variant="outline" class="h-auto flex-col gap-1.5 py-3 text-xs">
					<Power class="h-5 w-5 {data.store.isOpen ? 'text-green-500' : 'text-red-500'}" />
					<span>{data.store.isOpen ? 'Tutup' : 'Buka'}</span>
				</Button>
			</form>
		</div>
	</Card>

	<!-- Danger Zone -->
	<Card class="border-destructive/30">
		<h3 class="mb-4 text-sm font-semibold uppercase tracking-wide text-destructive">Zona Bahaya</h3>
		<div class="flex items-center justify-between">
			<div>
				<p class="font-medium text-foreground">Hapus Lapak</p>
				<p class="text-sm text-muted-foreground">Tindakan ini tidak dapat dibatalkan</p>
			</div>
			<Button onclick={() => (showDeleteConfirm = true)} variant="outline" class="text-destructive hover:bg-destructive/10">
				<Trash2 class="mr-2 h-4 w-4" />
				Hapus
			</Button>
		</div>
	</Card>
</div>

<!-- Delete Confirmation Modal -->
{#if showDeleteConfirm}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
		<Card class="w-full max-w-md">
			<h3 class="text-lg font-semibold text-foreground">Hapus Lapak?</h3>
			<p class="mt-2 text-muted-foreground">
				Semua data termasuk anggota, produk, dan transaksi akan dihapus permanen.
			</p>
			<form method="POST" action="?/delete" use:enhance class="mt-4 flex gap-3">
				<Button type="button" variant="outline" class="flex-1" onclick={() => (showDeleteConfirm = false)}>
					Batal
				</Button>
				<Button type="submit" variant="destructive" class="flex-1">
					Ya, Hapus
				</Button>
			</form>
		</Card>
	</div>
{/if}
