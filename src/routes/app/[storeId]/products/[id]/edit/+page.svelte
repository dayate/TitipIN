<script lang="ts">
	import { Card, Button, Input, NumberInput } from '$lib/components/ui';
	import { enhance } from '$app/forms';
	import { ArrowLeft, Package, Save, Upload, X, ImageOff } from 'lucide-svelte';

	let { data, form } = $props();

	let name = $state(data.product.name);
	let description = $state(data.product.description || '');
	let priceBuy = $state(data.product.priceBuy);
	let suggestedPrice = $state(data.product.suggestedPriceSell || 0);
	let loading = $state(false);
	let imagePreview = $state<string | null>(data.product.imageUrl);
	let imageFile = $state<File | null>(null);

	let formError = $derived(form?.error || '');
	let isFormValid = $derived(name.length >= 3 && priceBuy > 0);

	function handleImageChange(event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];

		if (file) {
			if (file.size > 5 * 1024 * 1024) {
				alert('Ukuran file maksimal 5MB');
				return;
			}

			imageFile = file;
			const reader = new FileReader();
			reader.onload = (e) => {
				imagePreview = e.target?.result as string;
			};
			reader.readAsDataURL(file);
		}
	}

	function removeImage() {
		imagePreview = null;
		imageFile = null;
	}
</script>

<svelte:head>
	<title>Edit Produk - {data.store.name} - Mak Unyil</title>
</svelte:head>

<div class="mx-auto max-w-2xl space-y-6">
	<div>
		<a
			href="/app/{data.store.id}/products"
			class="mb-2 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
		>
			<ArrowLeft class="h-4 w-4" />
			Kembali ke Produk
		</a>
		<h1 class="text-2xl font-bold text-foreground">Edit Produk</h1>
		<p class="text-muted-foreground">{data.store.name}</p>
	</div>

	<form
		method="POST"
		enctype="multipart/form-data"
		use:enhance={() => {
			loading = true;
			return async ({ update }) => {
				loading = false;
				await update();
			};
		}}
	>
		<Card class="space-y-6">
			<div
				class="flex items-start gap-3 rounded-lg bg-yellow-100 p-4 text-sm text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
			>
				<Package class="h-5 w-5 flex-shrink-0" />
				<p>
					Setelah mengedit, produk akan kembali ke status "Menunggu" dan perlu disetujui ulang oleh admin.
				</p>
			</div>

			<!-- Image Upload -->
			<div class="space-y-2">
				<label class="text-sm font-medium text-foreground">Foto Produk</label>

				{#if imagePreview}
					<div class="relative w-40">
						<img
							src={imagePreview}
							alt="Preview"
							class="h-40 w-40 rounded-lg object-cover"
						/>
						<button
							type="button"
							onclick={removeImage}
							class="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground"
						>
							<X class="h-4 w-4" />
						</button>
					</div>
				{:else}
					<label
						class="flex h-40 w-40 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border hover:border-primary hover:bg-muted/50"
					>
						<Upload class="h-8 w-8 text-muted-foreground" />
						<span class="mt-2 text-sm text-muted-foreground">Upload Foto</span>
						<input
							type="file"
							name="image"
							accept="image/*"
							class="hidden"
							onchange={handleImageChange}
						/>
					</label>
				{/if}
			</div>

			<Input
				id="name"
				name="name"
				label="Nama Produk"
				placeholder="Contoh: Kue Lapis Legit"
				required
				bind:value={name}
			/>

			<div class="space-y-2">
				<label for="description" class="text-sm font-medium text-foreground">
					Deskripsi (Opsional)
				</label>
				<textarea
					id="description"
					name="description"
					rows="3"
					class="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground"
					placeholder="Deskripsi produk..."
					bind:value={description}
				></textarea>
			</div>

			<NumberInput
				id="priceBuy"
				name="priceBuy"
				label="Harga Setor (Rp)"
				min={0}
				step={500}
				bind:value={priceBuy}
			/>

			<!-- Suggested Price -->
			<div class="space-y-2">
				<NumberInput
					id="suggestedPrice"
					name="suggestedPrice"
					label="Rekomendasi Harga Jual (Rp) - Opsional"
					min={0}
					step={500}
					bind:value={suggestedPrice}
				/>
				{#if suggestedPrice > 0 && priceBuy > 0}
					{@const margin = ((suggestedPrice - priceBuy) / priceBuy * 100).toFixed(0)}
					<p class="text-xs text-muted-foreground">
						Margin keuntungan: <span class="font-medium {parseInt(margin) >= 20 ? 'text-green-600' : parseInt(margin) >= 10 ? 'text-yellow-600' : 'text-red-600'}">{margin}%</span>
					</p>
				{/if}
			</div>

			{#if formError}
				<div class="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
					{formError}
				</div>
			{/if}

			<Button type="submit" class="w-full gap-2" disabled={!isFormValid || loading}>
				<Save class="h-4 w-4" />
				{loading ? 'Menyimpan...' : 'Simpan Perubahan'}
			</Button>
		</Card>
	</form>
</div>
