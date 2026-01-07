<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import {
		X,
		Plus,
		Minus,
		Save,
		ShoppingBag,
		CalendarDays,
		CheckCircle2,
		AlertCircle,
		ImageOff
	} from 'lucide-svelte';

	interface Product {
		id: number;
		name: string;
		priceBuy: number;
		imageUrl: string | null;
	}

	interface Props {
		open: boolean;
		storeId: number;
		storeName: string;
		date: string;
		products: Product[];
		onClose: () => void;
	}

	let { open = $bindable(), storeId, storeName, date, products, onClose }: Props = $props();

	let quantities = $state<Record<number, number>>({});
	let validationErrors = $state<Record<number, string>>({});
	let formError = $state('');
	let formSuccess = $state(false);
	let loading = $state(false);

	// Reset quantities when modal opens
	$effect(() => {
		if (open) {
			const initial: Record<number, number> = {};
			for (const product of products) {
				initial[product.id] = 0;
			}
			quantities = initial;
			validationErrors = {};
			formError = '';
			formSuccess = false;
		}
	});

	function formatCurrency(value: number) {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0
		}).format(value);
	}

	function formatDate(dateString: string) {
		const d = new Date(dateString);
		return d.toLocaleDateString('id-ID', {
			weekday: 'long',
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}

	function getQty(productId: number): number {
		return quantities[productId] ?? 0;
	}

	function setQty(productId: number, value: number) {
		const sanitized = Math.max(0, Math.floor(value));
		quantities[productId] = sanitized;
		if (sanitized < 0) {
			validationErrors[productId] = 'Jumlah tidak boleh negatif';
		} else {
			delete validationErrors[productId];
		}
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

		if (rawValue !== '' && !/^\d*$/.test(rawValue)) {
			input.value = String(getQty(productId));
			return;
		}

		const val = parseInt(rawValue) || 0;
		setQty(productId, val);
	}

	let totalItems = $derived(Object.values(quantities).reduce((sum, qty) => sum + qty, 0));

	let totalValue = $derived(
		products.reduce((sum, product) => {
			return sum + getQty(product.id) * product.priceBuy;
		}, 0)
	);

	let hasChanges = $derived(totalItems > 0);
	let hasErrors = $derived(Object.keys(validationErrors).length > 0);

	function handleClose() {
		if (!loading) {
			open = false;
			onClose();
		}
	}
</script>

{#if open}
	<!-- Backdrop -->
	<div
		class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
		onclick={handleClose}
		onkeydown={(e) => e.key === 'Escape' && handleClose()}
		role="button"
		tabindex="0"
		aria-label="Close modal"
	></div>

	<!-- Modal -->
	<div class="fixed inset-4 z-50 flex items-center justify-center sm:inset-8">
		<div
			class="relative flex max-h-full w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
		>
			<!-- Header -->
			<div
				class="flex items-center justify-between border-b border-border bg-gradient-to-r from-primary/10 to-transparent p-4"
			>
				<div class="flex items-center gap-3">
					<div class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20">
						<ShoppingBag class="h-5 w-5 text-primary" />
					</div>
					<div>
						<h2 class="text-lg font-semibold text-foreground">Input Setoran</h2>
						<p class="text-sm text-muted-foreground">{storeName}</p>
					</div>
				</div>
				<button
					onclick={handleClose}
					class="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted transition-colors"
					aria-label="Tutup"
					disabled={loading}
				>
					<X class="h-5 w-5 text-muted-foreground" />
				</button>
			</div>

			<!-- Date Info -->
			<div class="border-b border-border bg-muted/30 px-4 py-3">
				<div class="flex items-center gap-2 text-sm">
					<CalendarDays class="h-4 w-4 text-muted-foreground" />
					<span class="text-muted-foreground">Tanggal Setoran:</span>
					<span class="font-medium text-foreground">{formatDate(date)}</span>
				</div>
			</div>

			<!-- Success Message -->
			{#if formSuccess}
				<div
					class="mx-4 mt-4 flex items-center gap-3 rounded-xl bg-green-500/10 border border-green-500/20 p-3"
				>
					<CheckCircle2 class="h-5 w-5 text-green-600 dark:text-green-400" />
					<span class="text-sm font-medium text-green-600 dark:text-green-400"
						>Setoran berhasil disimpan!</span
					>
				</div>
			{/if}

			<!-- Error Message -->
			{#if formError}
				<div
					class="mx-4 mt-4 flex items-center gap-3 rounded-xl bg-destructive/10 border border-destructive/20 p-3"
				>
					<AlertCircle class="h-5 w-5 text-destructive" />
					<span class="text-sm font-medium text-destructive">{formError}</span>
				</div>
			{/if}

			<!-- Product List -->
			<form
				method="POST"
				action="/app/{storeId}/setor?/save"
				use:enhance={() => {
					loading = true;
					formError = '';
					formSuccess = false;
					return async ({ result, update }) => {
						loading = false;
						if (result.type === 'success') {
							formSuccess = true;
							// Reset quantities
							const initial: Record<number, number> = {};
							for (const product of products) {
								initial[product.id] = 0;
							}
							quantities = initial;
							await invalidateAll();
							// Auto close after success
							setTimeout(() => {
								handleClose();
							}, 1500);
						} else if (result.type === 'failure') {
							formError = (result.data as { error?: string })?.error || 'Terjadi kesalahan';
						}
					};
				}}
				class="flex flex-1 flex-col overflow-hidden"
			>
				<input type="hidden" name="date" value={date} />

				<div class="flex-1 overflow-y-auto p-4 space-y-3">
					{#if products.length === 0}
						<div class="py-12 text-center">
							<div
								class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted"
							>
								<ShoppingBag class="h-8 w-8 text-muted-foreground" />
							</div>
							<p class="font-medium text-foreground">Belum ada produk</p>
							<p class="text-sm text-muted-foreground">Anda belum memiliki produk yang disetujui</p>
						</div>
					{:else}
						{#each products as product}
							{@const qty = getQty(product.id)}
							<div
								class="rounded-xl border border-border bg-background p-3 transition-all {qty > 0
									? 'border-primary/40 bg-primary/5'
									: ''}"
							>
								<div class="flex items-center gap-3">
									<!-- Product Image -->
									<div
										class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-muted overflow-hidden"
									>
										{#if product.imageUrl}
											<img
												src={product.imageUrl}
												alt={product.name}
												class="h-full w-full object-cover"
											/>
										{:else}
											<ImageOff class="h-5 w-5 text-muted-foreground" />
										{/if}
									</div>

									<!-- Product Info -->
									<div class="min-w-0 flex-1">
										<h3 class="font-medium text-foreground text-sm truncate">{product.name}</h3>
										<p class="text-xs text-muted-foreground">{formatCurrency(product.priceBuy)}</p>
									</div>

									<!-- Quantity Controls -->
									<div class="flex items-center">
										<input type="hidden" name="productId" value={product.id} />
										<input type="hidden" name="qty" value={qty} />

										<button
											type="button"
											onclick={() => decrement(product.id)}
											disabled={qty <= 0}
											class="flex h-8 w-8 items-center justify-center rounded-l-lg border border-border bg-muted hover:bg-muted/80 disabled:opacity-40 transition-colors"
										>
											<Minus class="h-3 w-3" />
										</button>

										<input
											type="text"
											inputmode="numeric"
											pattern="[0-9]*"
											value={qty}
											oninput={(e) => handleQtyInput(product.id, e)}
											onkeydown={(e) => {
												if (e.key === '-' || e.key === 'e' || e.key === '+' || e.key === '.') {
													e.preventDefault();
												}
											}}
											class="h-8 w-10 border-y border-border bg-background text-center text-sm font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-ring [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
										/>

										<button
											type="button"
											onclick={() => increment(product.id)}
											class="flex h-8 w-8 items-center justify-center rounded-r-lg border border-border bg-muted hover:bg-muted/80 transition-colors"
										>
											<Plus class="h-3 w-3" />
										</button>
									</div>
								</div>

								<!-- Subtotal -->
								{#if qty > 0}
									<div class="mt-2 flex justify-end text-xs text-muted-foreground">
										Subtotal: <span class="ml-1 font-semibold text-primary"
											>{formatCurrency(qty * product.priceBuy)}</span
										>
									</div>
								{/if}
							</div>
						{/each}
					{/if}
				</div>

				<!-- Footer -->
				{#if products.length > 0}
					<div class="border-t border-border bg-card p-4">
						<div class="flex items-center justify-between">
							<div>
								<p class="text-xs text-muted-foreground">Total Setoran</p>
								<p class="text-lg font-bold text-primary">
									{totalItems} item • {formatCurrency(totalValue)}
								</p>
							</div>
							<button
								type="submit"
								disabled={!hasChanges || hasErrors || loading}
								class="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 font-semibold text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
							>
								{#if loading}
									<div
										class="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground"
									></div>
									Menyimpan...
								{:else}
									<Save class="h-4 w-4" />
									Simpan
								{/if}
							</button>
						</div>
					</div>
				{/if}
			</form>
		</div>
	</div>
{/if}
