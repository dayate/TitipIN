<script lang="ts">
	import { Card, Button } from '$lib/components/ui';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import { Store, CheckCircle2, XCircle, AlertCircle, ArrowRight } from 'lucide-svelte';

	let { data, form } = $props();

	let loading = $state(false);

	let formError = $derived(form?.error || '');
	let formSuccess = $derived(form?.success || false);
	let autoApproved = $derived(form?.autoApproved || false);
	let isLoggedIn = $derived($page.data.user != null);
</script>

<svelte:head>
	<title>{data.store?.name || 'Gabung Lapak'} - Mak Unyil</title>
</svelte:head>

<div class="flex min-h-screen flex-col bg-background">
	<!-- Header -->
	<header class="border-b border-border bg-card">
		<div class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
			<a href="/" class="flex items-center gap-2">
				<div class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
					<Store class="h-6 w-6 text-primary-foreground" />
				</div>
				<span class="text-xl font-bold text-foreground">Mak Unyil</span>
			</a>
			<ThemeToggle />
		</div>
	</header>

	<!-- Main Content -->
	<main class="flex flex-1 items-center justify-center px-4 py-12">
		<Card class="w-full max-w-md text-center">
			{#if formSuccess}
				<!-- Success State -->
				<div
					class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30"
				>
					<CheckCircle2 class="h-8 w-8 text-green-600 dark:text-green-400" />
				</div>
				{#if autoApproved}
					<h1 class="text-2xl font-bold text-foreground">Berhasil Bergabung! 🎉</h1>
					<p class="mt-2 text-muted-foreground">
						Anda sudah menjadi anggota <strong>{data.store?.name}</strong>. Anda bisa langsung mulai
						menyetor produk.
					</p>
					<Button href="/app/stores" class="mt-6 w-full">Lihat Lapak Saya</Button>
				{:else}
					<h1 class="text-2xl font-bold text-foreground">Permintaan Terkirim! 🎉</h1>
					<p class="mt-2 text-muted-foreground">
						Permintaan bergabung ke <strong>{data.store?.name}</strong> telah dikirim. Tunggu persetujuan
						dari pemilik lapak.
					</p>
					<Button href="/app/stores" class="mt-6 w-full">Lihat Lapak Saya</Button>
				{/if}
			{:else if !data.valid}
				<!-- Invalid Code -->
				<div
					class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30"
				>
					<XCircle class="h-8 w-8 text-red-600 dark:text-red-400" />
				</div>
				<h1 class="text-2xl font-bold text-foreground">Kode Tidak Valid</h1>
				<p class="mt-2 text-muted-foreground">{data.error}</p>
				<div class="mt-6 space-y-3">
					<Button href="/" variant="outline" class="w-full">Kembali ke Beranda</Button>
				</div>
			{:else}
				<!-- Valid Code - Show Store Info -->
				<div
					class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10"
				>
					<Store class="h-8 w-8 text-primary" />
				</div>
				<h1 class="text-2xl font-bold text-foreground">Gabung Lapak</h1>
				<p class="mt-2 text-muted-foreground">Anda diundang untuk bergabung ke</p>

				<!-- Store Preview -->
				<div class="my-6 rounded-xl bg-muted p-4">
					<h2 class="text-xl font-bold text-foreground">{data.store?.name}</h2>
					{#if data.store?.description}
						<p class="mt-2 text-sm text-muted-foreground">{data.store.description}</p>
					{/if}
				</div>

				{#if formError}
					<div class="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
						{formError}
					</div>
				{/if}

				{#if isLoggedIn}
					<!-- User is logged in - can join directly -->
					<form
						method="POST"
						use:enhance={() => {
							loading = true;
							return async ({ update }) => {
								loading = false;
								await update();
							};
						}}
					>
						<Button type="submit" class="w-full gap-2" disabled={loading}>
							{loading ? 'Memproses...' : 'Gabung Sekarang'}
							<ArrowRight class="h-4 w-4" />
						</Button>
					</form>
				{:else}
					<!-- User not logged in - need to login/register first -->
					<div class="space-y-3">
						<Button href="/auth/login?redirect=/join/{data.code}" class="w-full">
							Masuk untuk Bergabung
						</Button>
						<Button href="/auth/register" variant="outline" class="w-full">Buat Akun Baru</Button>
					</div>
				{/if}
			{/if}
		</Card>
	</main>
</div>
