<script lang="ts">
	import { Card, Button } from '$lib/components/ui';
	import { enhance } from '$app/forms';
	import {
		Package,
		Plus,
		Clock,
		CheckCircle2,
		XCircle,
		Trash2,
		ArrowLeft,
		ImageOff
	} from 'lucide-svelte';

	let { data } = $props();

	function getStatusBadge(status: string) {
		switch (status) {
			case 'approved':
				return {
					class: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
					label: 'Disetujui',
					Icon: CheckCircle2
				};
			case 'rejected':
				return {
					class: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
					label: 'Ditolak',
					Icon: XCircle
				};
			default:
				return {
					class: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
					label: 'Menunggu',
					Icon: Clock
				};
		}
	}

	function formatCurrency(value: number) {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0
		}).format(value);
	}

	let deleteConfirm = $state<number | null>(null);
</script>

<svelte:head>
	<title>Produk Saya - {data.store.name} - Mak Unyil</title>
</svelte:head>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<div>
			<a
				href="/app/stores"
				class="mb-2 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
			>
				<ArrowLeft class="h-4 w-4" />
				Kembali ke Lapak
			</a>
			<h1 class="text-2xl font-bold text-foreground">Produk Saya</h1>
			<p class="text-muted-foreground">{data.store.name}</p>
		</div>
		<Button href="/app/{data.store.id}/products/new" class="gap-2">
			<Plus class="h-4 w-4" />
			Tambah Produk
		</Button>
	</div>

	<!-- Stats -->
	<div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
		<Card class="text-center">
			<p class="text-2xl font-bold text-foreground">{data.counts.total}</p>
			<p class="text-sm text-muted-foreground">Total</p>
		</Card>
		<Card class="text-center">
			<p class="text-2xl font-bold text-yellow-600">{data.counts.pending}</p>
			<p class="text-sm text-muted-foreground">Menunggu</p>
		</Card>
		<Card class="text-center">
			<p class="text-2xl font-bold text-green-600">{data.counts.approved}</p>
			<p class="text-sm text-muted-foreground">Disetujui</p>
		</Card>
		<Card class="text-center">
			<p class="text-2xl font-bold text-red-600">{data.counts.rejected}</p>
			<p class="text-sm text-muted-foreground">Ditolak</p>
		</Card>
	</div>

	<!-- Products List -->
	{#if data.products.length === 0}
		<Card class="py-12 text-center">
			<div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
				<Package class="h-8 w-8 text-muted-foreground" />
			</div>
			<h2 class="text-lg font-semibold text-foreground">Belum ada produk</h2>
			<p class="mt-2 text-muted-foreground">Tambahkan produk pertama Anda untuk mulai berjualan</p>
			<Button href="/app/{data.store.id}/products/new" class="mt-4 gap-2">
				<Plus class="h-4 w-4" />
				Tambah Produk
			</Button>
		</Card>
	{:else}
		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each data.products as product}
				{@const status = getStatusBadge(product.status)}
				<Card class="relative">
					<!-- Status Badge -->
					<div class="absolute right-4 top-4">
						<span
							class="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium {status.class}"
						>
							<status.Icon class="h-3 w-3" />
							{status.label}
						</span>
					</div>

					<!-- Product Info -->
					<div class="flex gap-4">
						<!-- Image -->
						<div
							class="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-lg bg-muted"
						>
							{#if product.imageUrl}
								<img
									src={product.imageUrl}
									alt={product.name}
									class="h-full w-full rounded-lg object-cover"
								/>
							{:else}
								<ImageOff class="h-8 w-8 text-muted-foreground" />
							{/if}
						</div>
						<div class="min-w-0 flex-1">
							<h3 class="truncate text-lg font-semibold text-foreground">{product.name}</h3>
							{#if product.description}
								<p class="mt-1 line-clamp-2 text-sm text-muted-foreground">
									{product.description}
								</p>
							{/if}
						</div>
					</div>

					<!-- Prices -->
					<div class="mt-4 grid grid-cols-2 gap-4 rounded-lg bg-muted p-3">
						<div>
							<p class="text-xs text-muted-foreground">Harga Setor</p>
							<p class="font-semibold text-foreground">{formatCurrency(product.priceBuy)}</p>
						</div>
						<div>
							<p class="text-xs text-muted-foreground">Harga Jual</p>
							<p class="font-semibold text-foreground">{formatCurrency(product.priceSell)}</p>
						</div>
					</div>

					<!-- Actions -->
					<div class="mt-4 flex gap-2">
						<Button
							href="/app/{data.store.id}/products/{product.id}/edit"
							variant="outline"
							class="flex-1"
						>
							Edit
						</Button>
						{#if deleteConfirm === product.id}
							<form method="POST" action="?/delete" use:enhance class="flex gap-1">
								<input type="hidden" name="productId" value={product.id} />
								<Button type="submit" variant="destructive" size="sm">Ya</Button>
								<Button
									type="button"
									variant="outline"
									size="sm"
									onclick={() => (deleteConfirm = null)}
								>
									Batal
								</Button>
							</form>
						{:else}
							<Button
								variant="outline"
								class="text-destructive"
								onclick={() => (deleteConfirm = product.id)}
							>
								<Trash2 class="h-4 w-4" />
							</Button>
						{/if}
					</div>
				</Card>
			{/each}
		</div>
	{/if}
</div>
