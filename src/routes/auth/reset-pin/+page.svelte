<script lang="ts">
	import { Button, Input, Card } from '$lib/components/ui';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import { Store, ArrowLeft, CheckCircle2 } from 'lucide-svelte';
	import { enhance } from '$app/forms';

	let { form } = $props();

	let whatsapp = $state('');
	let newPin = $state('');
	let confirmPin = $state('');
	let loading = $state(false);

	let formError = $derived(form?.error || '');
	let formSuccess = $derived(form?.success || false);
	let pinMismatch = $derived(newPin !== confirmPin && confirmPin.length > 0);
	let isFormValid = $derived(
		whatsapp.length >= 10 &&
		newPin.length >= 6 &&
		newPin === confirmPin
	);
</script>

<svelte:head>
	<title>Reset PIN - Mak Unyil</title>
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
			<a href="/auth/login" class="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
				<ArrowLeft class="h-4 w-4" />
				Kembali ke Login
			</a>

			{#if formSuccess}
				<!-- Success State -->
				<div class="text-center">
					<div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
						<CheckCircle2 class="h-8 w-8 text-green-600 dark:text-green-400" />
					</div>
					<h1 class="text-2xl font-bold text-foreground">PIN Berhasil Direset</h1>
					<p class="mt-2 text-muted-foreground">
						PIN Anda telah berhasil diubah. Silakan login dengan PIN baru.
					</p>
					<Button href="/auth/login" class="mt-6 w-full">
						Masuk Sekarang
					</Button>
				</div>
			{:else}
				<!-- Reset Form -->
				<div class="mb-8 text-center">
					<h1 class="text-2xl font-bold text-foreground">Reset PIN</h1>
					<p class="mt-2 text-muted-foreground">
						Masukkan nomor WhatsApp dan PIN baru Anda
					</p>
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
					<Input
						id="whatsapp"
						name="whatsapp"
						type="tel"
						label="Nomor WhatsApp Terdaftar"
						placeholder="08xxxxxxxxxx"
						required
						bind:value={whatsapp}
					/>

					<Input
						id="newPin"
						name="newPin"
						type="password"
						label="PIN Baru (minimal 6 digit)"
						placeholder="Masukkan PIN baru"
						minlength={6}
						maxlength={6}
						required
						bind:value={newPin}
					/>

					<Input
						id="confirmPin"
						name="confirmPin"
						type="password"
						label="Konfirmasi PIN Baru"
						placeholder="Ulangi PIN baru"
						minlength={6}
						maxlength={6}
						required
						bind:value={confirmPin}
						error={pinMismatch ? 'PIN tidak cocok' : ''}
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
							Reset PIN
						{/if}
					</Button>
				</form>

				<p class="mt-6 text-center text-sm text-muted-foreground">
					Ingat PIN Anda?
					<a href="/auth/login" class="font-medium text-primary hover:underline">
						Masuk di sini
					</a>
				</p>
			{/if}
		</Card>
	</main>
</div>
