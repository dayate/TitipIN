<script lang="ts">
	import { Card, Button, Input } from '$lib/components/ui';
	import { enhance } from '$app/forms';
	import { ArrowLeft, Link, Store, CheckCircle2 } from 'lucide-svelte';

	let { form } = $props();

	let code = $state('');
	let loading = $state(false);

	let formError = $derived(form?.error || '');
	let formSuccess = $derived(form?.success || false);
	let storeName = $derived(form?.storeName || '');
	let isFormValid = $derived(code.length >= 6);
</script>

<svelte:head>
	<title>Gabung Lapak - Mak Unyil</title>
</svelte:head>

<div class="mx-auto max-w-md space-y-6">
	<!-- Header -->
	<div>
		<a href="/app/stores" class="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
			<ArrowLeft class="h-4 w-4" />
			Kembali
		</a>
	</div>

	{#if formSuccess}
		<!-- Success State -->
		<Card class="text-center">
			<div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
				<CheckCircle2 class="h-8 w-8 text-green-600 dark:text-green-400" />
			</div>
			<h1 class="text-2xl font-bold text-foreground">Permintaan Terkirim! 🎉</h1>
			<p class="mt-2 text-muted-foreground">
				Permintaan bergabung ke <strong>{storeName}</strong> telah dikirim.
				Tunggu persetujuan dari pemilik lapak.
			</p>
			<Button href="/app/stores" class="mt-6 w-full">
				Lihat Lapak Saya
			</Button>
		</Card>
	{:else}
		<Card>
			<div class="mb-6 text-center">
				<div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
					<Link class="h-8 w-8 text-primary" />
				</div>
				<h1 class="text-2xl font-bold text-foreground">Gabung Lapak</h1>
				<p class="mt-2 text-muted-foreground">Masukkan kode undangan dari pemilik lapak</p>
			</div>

			<form
				method="POST"
				use:enhance={() => {
					loading = true;
					return async ({ update }) => {
						loading = false;
						await update();
					};
				}}
				class="space-y-4"
			>
				<div class="space-y-2">
					<label for="code" class="text-sm font-medium text-foreground">Kode Undangan</label>
					<input
						id="code"
						name="code"
						type="text"
						placeholder="Contoh: ABC12345"
						required
						bind:value={code}
						class="flex h-12 w-full rounded-lg border border-input bg-background px-4 py-2 text-center text-lg font-bold uppercase tracking-widest text-foreground ring-offset-background placeholder:text-muted-foreground placeholder:font-normal placeholder:tracking-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
					/>
				</div>

				{#if formError}
					<div class="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
						{formError}
					</div>
				{/if}

				<Button type="submit" class="w-full" disabled={!isFormValid || loading}>
					{#if loading}
						Memproses...
					{:else}
						Gabung Lapak
					{/if}
				</Button>
			</form>

			<p class="mt-6 text-center text-sm text-muted-foreground">
				Minta kode undangan kepada pemilik lapak yang ingin Anda ikuti
			</p>
		</Card>
	{/if}
</div>
