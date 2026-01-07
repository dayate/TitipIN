<script lang="ts">
	import { Card, Button, Input, NumberInput } from '$lib/components/ui';
	import { enhance } from '$app/forms';
	import { ArrowLeft, Package, Save, Upload, X, ImageOff } from 'lucide-svelte';

	let { data, form } = $props();

	let name = $state('');
	let description = $state('');
	let priceBuy = $state(0);
	let suggestedPrice = $state(0);
	let loading = $state(false);
	let imagePreview = $state<string | null>(null);
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
	<title>Tambah Produk - {data.store.name} - Mak Unyil</title>
</svelte:head>

<div class="mx-auto max-w-2xl space-y-6">
	<!-- Header -->
	<div>
		<a
			href="/app/{data.store.id}/products"
			class="mb-2 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
		>
			<ArrowLeft class="h-4 w-4" />
			Kembali ke Produk
		</a>
		<h1 class="text-2xl font-bold text-foreground">Tambah Produk Baru</h1>
		<p class="text-muted-foreground">{data.store.name}</p>
	</div>

	<!-- Form -->
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
			<!-- Info -->
			<div class="flex items-start gap-3 rounded-lg bg-primary/10 p-4 text-sm text-primary">
				<Package class="h-5 w-5 flex-shrink-0" />
				<p>
					Produk yang Anda daftarkan akan direview oleh admin lapak. Admin akan menentukan harga
					jual produk.
				</p>
			</div>

			<!-- Image Upload -->
			<div class="space-y-2">
				<label for="image-input" class="text-sm font-medium text-foreground"
					>Foto Produk (Opsional)</label
				>

				<!-- Hidden file input that's always in DOM -->
				<input
					type="file"
					id="image-input"
					name="image"
					accept="image/jpeg,image/png,image/webp"
					class="hidden"
					onchange={handleImageChange}
				/>

				{#if imagePreview}
					<div class="relative w-40">
						<img src={imagePreview} alt="Preview" class="h-40 w-40 rounded-lg object-cover" />
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
						for="image-input"
						class="flex h-40 w-40 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border hover:border-primary hover:bg-muted/50"
					>
						<Upload class="h-8 w-8 text-muted-foreground" />
						<span class="mt-2 text-sm text-muted-foreground">Upload Foto</span>
					</label>
				{/if}
				<p class="text-xs text-muted-foreground">Format: JPG, PNG, WEBP. Maks 5MB</p>
			</div>

			<!-- Product Name -->
			<Input
				id="name"
				name="name"
				label="Nama Produk"
				placeholder="Contoh: Kue Lapis Legit"
				required
				bind:value={name}
			/>

			<!-- Description -->
			<div class="space-y-2">
				<label for="description" class="text-sm font-medium text-foreground">
					Deskripsi (Opsional)
				</label>
				<textarea
					id="description"
					name="description"
					rows="3"
					class="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
					placeholder="Deskripsi produk..."
					bind:value={description}
				></textarea>
			</div>

			<!-- Price Buy -->
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
					{@const margin = (((suggestedPrice - priceBuy) / priceBuy) * 100).toFixed(0)}
					<p class="text-xs text-muted-foreground">
						Margin keuntungan: <span
							class="font-medium {parseInt(margin) >= 20
								? 'text-green-600'
								: parseInt(margin) >= 10
									? 'text-yellow-600'
									: 'text-red-600'}">{margin}%</span
						>
					</p>
				{/if}
			</div>

			<div class="rounded-lg bg-muted p-4">
				<p class="text-sm text-muted-foreground">
					💡 <strong>Catatan:</strong> Harga jual final akan ditentukan oleh admin lapak saat menyetujui
					produk Anda. Rekomendasi harga jual akan dipertimbangkan.
				</p>
			</div>

			<!-- Error -->
			{#if formError}
				<div class="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
					{formError}
				</div>
			{/if}

			<!-- Submit -->
			<Button type="submit" class="w-full gap-2" disabled={!isFormValid || loading}>
				<Save class="h-4 w-4" />
				{loading ? 'Menyimpan...' : 'Simpan Produk'}
			</Button>
		</Card>
	</form>
</div>
