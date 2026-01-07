<script lang="ts">
	import { Button, Input, Card } from '$lib/components/ui';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import { Store, ArrowLeft } from 'lucide-svelte';
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';

	let { form } = $props();

	let whatsapp = $state('');
	let pin = $state('');
	let loading = $state(false);

	// Validation
	let whatsappError = $derived(() => {
		if (whatsapp.length === 0) return '';
		const cleaned = whatsapp.replace(/\D/g, '');
		if (cleaned.length < 10) return 'Nomor minimal 10 digit';
		if (cleaned.length > 15) return 'Nomor maksimal 15 digit';
		if (!cleaned.startsWith('08') && !cleaned.startsWith('62')) return 'Harus diawali 08 atau 62';
		return '';
	});

	let pinError = $derived(() => {
		if (pin.length === 0) return '';
		if (!/^\d+$/.test(pin)) return 'PIN hanya boleh angka';
		if (pin.length < 6) return 'PIN minimal 6 digit';
		return '';
	});

	let formError = $derived(form?.error || '');
	let isFormValid = $derived(
		whatsapp.replace(/\D/g, '').length >= 10 &&
			whatsapp.replace(/\D/g, '').length <= 15 &&
			pin.length >= 6 &&
			/^\d+$/.test(pin) &&
			!whatsappError() &&
			!pinError()
	);

	// Get redirect URL from query params
	let redirectTo = $derived($page.url.searchParams.get('redirect') || '');
</script>

<svelte:head>
	<title>Masuk - Mak Unyil</title>
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
		<Card class="w-full max-w-md">
			<!-- Back Link -->
			<a
				href="/"
				class="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
			>
				<ArrowLeft class="h-4 w-4" />
				Kembali ke Beranda
			</a>

			<div class="mb-8 text-center">
				<div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary">
					<Store class="h-8 w-8 text-primary-foreground" />
				</div>
				<h1 class="text-2xl font-bold text-foreground">Selamat Datang</h1>
				<p class="mt-2 text-muted-foreground">Masuk ke akun Mak Unyil Anda</p>
			</div>

			<!-- Login Form -->
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
				<input type="hidden" name="redirect" value={redirectTo} />

				<Input
					id="whatsapp"
					name="whatsapp"
					type="tel"
					label="Nomor WhatsApp"
					placeholder="08xxxxxxxxxx"
					required
					bind:value={whatsapp}
					error={whatsappError()}
				/>

				<Input
					id="pin"
					name="pin"
					type="password"
					label="PIN (6 digit angka)"
					placeholder="Masukkan 6 digit PIN"
					minlength={6}
					maxlength={6}
					required
					bind:value={pin}
					error={pinError()}
					showPasswordToggle={true}
				/>

				{#if formError}
					<div class="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
						{formError}
					</div>
				{/if}

				<Button type="submit" class="w-full" disabled={!isFormValid || loading}>
					{#if loading}
						Memproses...
					{:else}
						Masuk
					{/if}
				</Button>
			</form>

			<div class="my-6 flex items-center gap-4">
				<div class="h-px flex-1 bg-border"></div>
				<span class="text-sm text-muted-foreground">atau</span>
				<div class="h-px flex-1 bg-border"></div>
			</div>

			<div class="space-y-3">
				<a href="/auth/reset-pin" class="block text-center text-sm text-primary hover:underline">
					Lupa PIN?
				</a>
				<p class="text-center text-sm text-muted-foreground">
					Belum punya akun?
					<a href="/auth/register" class="font-medium text-primary hover:underline">
						Daftar sekarang
					</a>
				</p>
			</div>
		</Card>
	</main>
</div>
