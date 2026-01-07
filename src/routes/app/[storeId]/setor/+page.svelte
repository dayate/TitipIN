<script lang="ts">
	import { Button } from '$lib/components/ui';
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import {
		Package,
		ArrowLeft,
		CalendarDays,
		Plus,
		Minus,
		Save,
		CheckCircle2,
		ImageOff,
		ShoppingBag
	} from 'lucide-svelte';

	let { data, form } = $props();

	// Initialize quantities
	function initQty() {
		const initial: Record<number, number> = {};
		for (const { item, product } of data.items) {
			initial[product.id] = item.qtyPlanned;
		}
		for (const product of data.products) {
			if (!(product.id in initial)) {
				initial[product.id] = 0;
			}
		}
		return initial;
	}

	let quantities = $state<Record<number, number>>(initQty());

	function formatCurrency(value: number) {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0
		}).format(value);
	}

	function formatDate(dateString: string) {
		const date = new Date(dateString);
		return date.toLocaleDateString('id-ID', {
			weekday: 'long',
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}

	function getQty(productId: number): number {
		return quantities[productId] ?? 0;
	}

	let validationErrors = $state<Record<number, string>>({});
	let formError = $state('');

	function validateQty(value: number): string | null {
		if (value < 0) return 'Jumlah tidak boleh negatif';
		if (!Number.isInteger(value)) return 'Jumlah harus bilangan bulat';
		return null;
	}

	function setQty(productId: number, value: number) {
		const sanitized = Math.max(0, Math.floor(value));
		const error = validateQty(sanitized);
		if (error) {
			validationErrors[productId] = error;
		} else {
			delete validationErrors[productId];
		}
		quantities[productId] = sanitized;
	}

	function increment(productId: number) {
		setQty(productId, getQty(productId) + 1);
	}

	function decrement(productId: number) {
		if (getQty(productId) > 0) {
			setQty(productId, getQty(productId) - 1);
		}
	}

	function handleQtyInput(productId: number, e: Event) {
		const input = e.target as HTMLInputElement;
		const rawValue = input.value;

		// Block non-numeric characters (except empty)
		if (rawValue !== '' && !/^\d*$/.test(rawValue)) {
			input.value = String(getQty(productId));
			return;
		}

		const val = parseInt(rawValue) || 0;
		setQty(productId, val);
	}

	let totalItems = $derived(Object.values(quantities).reduce((sum, qty) => sum + qty, 0));

	let totalValue = $derived(
		data.products.reduce((sum, product) => {
			return sum + getQty(product.id) * product.priceBuy;
		}, 0)
	);

	let hasChanges = $derived(totalItems > 0);
</script>

<svelte:head>
	<title>Input Setoran - {data.store.name} - Mak Unyil</title>
</svelte:head>

<div class="space-y-6">
	<!-- Header with Gradient -->
	<div
		class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-background p-6"
	>
		<div class="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/10 blur-2xl"></div>
		<a
			href="/app/stores"
			class="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
		>
			<ArrowLeft class="h-4 w-4" />
			Kembali
		</a>
		<div class="flex items-center gap-4">
			<div
				class="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/20 backdrop-blur-sm"
			>
				<ShoppingBag class="h-7 w-7 text-primary" />
			</div>
			<div>
				<h1 class="text-2xl font-bold text-foreground">Input Setoran</h1>
				<p class="text-muted-foreground">{data.store.name}</p>
			</div>
		</div>
	</div>

	<!-- Success Message -->
	{#if form?.success}
		<div class="flex items-center gap-3 rounded-2xl bg-green-500/10 border border-green-500/20 p-4">
			<div class="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/20">
				<CheckCircle2 class="h-4 w-4 text-green-600 dark:text-green-400" />
			</div>
			<span class="font-medium text-green-600 dark:text-green-400">Setoran berhasil disimpan!</span>
		</div>
	{/if}

	<!-- Date Card -->
	<div class="rounded-2xl border border-border bg-card p-4 shadow-sm">
		<div class="flex items-center gap-4">
			<div class="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
				<CalendarDays class="h-6 w-6 text-primary" />
			</div>
			<div>
				<p class="text-sm text-muted-foreground">Tanggal Setoran</p>
				<p class="font-semibold text-foreground">{formatDate(data.date)}</p>
			</div>
		</div>
	</div>

	<!-- Store Closed Warning -->
	{#if data.storeClosed}
		<div class="rounded-2xl border border-red-500/30 bg-red-500/5 p-6 text-center">
			<div
				class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10"
			>
				<Package class="h-8 w-8 text-red-500" />
			</div>
			<h2 class="text-lg font-semibold text-foreground">Lapak Sedang Tutup</h2>
			<p class="mt-2 text-muted-foreground">
				Anda tidak dapat melakukan setoran saat lapak sedang tutup. Silakan coba lagi saat lapak
				sudah buka.
			</p>
			<a
				href="/app/{data.store.id}"
				class="mt-4 inline-flex items-center gap-2 rounded-xl bg-muted px-4 py-2 font-medium text-foreground hover:bg-muted/80 transition-colors"
			>
				<ArrowLeft class="h-4 w-4" />
				Kembali ke Lapak
			</a>
		</div>
	{:else if data.products.length === 0}
		<div class="rounded-2xl border border-dashed border-border bg-muted/30 p-12 text-center">
			<div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
				<Package class="h-8 w-8 text-muted-foreground" />
			</div>
			<h2 class="text-lg font-semibold text-foreground">Belum ada produk</h2>
			<p class="mt-2 text-muted-foreground">
				Anda belum memiliki produk yang disetujui untuk lapak ini
			</p>
			<a
				href="/app/{data.store.id}/products"
				class="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
			>
				<Plus class="h-4 w-4" />
				Daftarkan Produk
			</a>
		</div>
	{:else}
		<form
			method="POST"
			action="?/save"
			use:enhance={() => {
				return async ({ update }) => {
					await update();
					await invalidateAll();
				};
			}}
			class="space-y-4"
		>
			<input type="hidden" name="date" value={data.date} />

			{#each data.products as product}
				{@const qty = getQty(product.id)}
				<div
					class="rounded-2xl border border-border bg-card p-4 shadow-sm transition-all {qty > 0
						? 'border-primary/30 bg-primary/5'
						: ''}"
				>
					<div class="flex items-center gap-4">
						<!-- Product Image -->
						<div
							class="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl bg-muted overflow-hidden"
						>
							{#if product.imageUrl}
								<img src={product.imageUrl} alt={product.name} class="h-full w-full object-cover" />
							{:else}
								<ImageOff class="h-6 w-6 text-muted-foreground" />
							{/if}
						</div>

						<!-- Product Info -->
						<div class="min-w-0 flex-1">
							<h3 class="font-semibold text-foreground">{product.name}</h3>
							<p class="text-sm text-muted-foreground">
								{formatCurrency(product.priceBuy)} per item
							</p>
						</div>

						<!-- Quantity Controls -->
						<div class="flex items-center">
							<input type="hidden" name="productId" value={product.id} />
							<input type="hidden" name="qty" value={qty} />

							<button
								type="button"
								onclick={() => decrement(product.id)}
								disabled={qty <= 0}
								class="flex h-10 w-10 items-center justify-center rounded-l-xl border border-border bg-muted hover:bg-muted/80 disabled:opacity-40 transition-colors"
							>
								<Minus class="h-4 w-4" />
							</button>

							<input
								type="text"
								inputmode="numeric"
								pattern="[0-9]*"
								value={qty}
								oninput={(e) => handleQtyInput(product.id, e)}
								onkeydown={(e) => {
									// Block minus and certain special keys
									if (e.key === '-' || e.key === 'e' || e.key === '+' || e.key === '.') {
										e.preventDefault();
									}
								}}
								class="h-10 w-14 border-y border-border bg-background text-center text-lg font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-ring [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none {validationErrors[
									product.id
								]
									? 'border-destructive'
									: ''}"
							/>

							<button
								type="button"
								onclick={() => increment(product.id)}
								class="flex h-10 w-10 items-center justify-center rounded-r-xl border border-border bg-muted hover:bg-muted/80 transition-colors"
							>
								<Plus class="h-4 w-4" />
							</button>
						</div>
					</div>

					<!-- Subtotal -->
					{#if qty > 0}
						<div class="mt-3 flex justify-end border-t border-border pt-3">
							<p class="text-sm text-muted-foreground">
								Subtotal:
								<span class="font-semibold text-primary">
									{formatCurrency(qty * product.priceBuy)}
								</span>
							</p>
						</div>
					{/if}
				</div>
			{/each}

			<!-- Summary & Submit -->
			{#if hasChanges}
				<div
					class="sticky bottom-4 mt-6 rounded-2xl border border-primary/20 bg-card/95 p-4 shadow-lg backdrop-blur"
				>
					<div class="flex items-center justify-between">
						<div>
							<p class="text-sm text-muted-foreground">Total Setoran</p>
							<p class="text-xl font-bold text-primary">
								{totalItems} item • {formatCurrency(totalValue)}
							</p>
						</div>
						<button
							type="submit"
							class="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all"
						>
							<Save class="h-5 w-5" />
							Simpan
						</button>
					</div>
				</div>
			{/if}
		</form>
	{/if}
</div>
