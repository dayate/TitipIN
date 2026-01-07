<script lang="ts">
	import { Button, Input, Card } from '$lib/components/ui';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import { Store, ArrowLeft, User, Building2, CheckCircle2 } from 'lucide-svelte';
	import { enhance } from '$app/forms';

	let { form } = $props();

	let name = $state('');
	let whatsapp = $state('');
	let pin = $state('');
	let confirmPin = $state('');
	let role = $state<'owner' | 'supplier'>('supplier');
	let loading = $state(false);

	// Validation states
	let nameError = $derived(() => {
		if (name.length === 0) return '';
		if (name.length < 3) return 'Nama minimal 3 karakter';
		if (name.length > 50) return 'Nama maksimal 50 karakter';
		if (!/^[a-zA-Z\s]+$/.test(name)) return 'Nama hanya boleh huruf dan spasi';
		return '';
	});

	let whatsappError = $derived(() => {
		if (whatsapp.length === 0) return '';
		const cleaned = whatsapp.replace(/\D/g, '');
		if (cleaned.length < 10) return 'Nomor minimal 10 digit';
		if (cleaned.length > 15) return 'Nomor maksimal 15 digit';
		if (!cleaned.startsWith('08') && !cleaned.startsWith('62'))
			return 'Nomor harus diawali 08 atau 62';
		return '';
	});

	let pinError = $derived(() => {
		if (pin.length === 0) return '';
		if (!/^\d+$/.test(pin)) return 'PIN hanya boleh angka';
		if (pin.length < 6) return 'PIN minimal 6 digit';
		if (pin.length > 6) return 'PIN maksimal 6 digit';
		return '';
	});

	let confirmPinError = $derived(() => {
		if (confirmPin.length === 0) return '';
		if (pin !== confirmPin) return 'PIN tidak cocok';
		return '';
	});

	let formError = $derived(form?.error || '');
	let formSuccess = $derived(form?.success || false);

	let isFormValid = $derived(
		name.length >= 3 &&
			name.length <= 50 &&
			/^[a-zA-Z\s]+$/.test(name) &&
			whatsapp.replace(/\D/g, '').length >= 10 &&
			whatsapp.replace(/\D/g, '').length <= 15 &&
			pin.length === 6 &&
			/^\d+$/.test(pin) &&
			pin === confirmPin &&
			!nameError() &&
			!whatsappError() &&
			!pinError() &&
			!confirmPinError()
	);
</script>

<svelte:head>
	<title>Daftar - Mak Unyil</title>
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

			{#if formSuccess}
				<!-- Success State -->
				<div class="text-center">
					<div
						class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30"
					>
						<CheckCircle2 class="h-8 w-8 text-green-600 dark:text-green-400" />
					</div>
					<h1 class="text-2xl font-bold text-foreground">Pendaftaran Berhasil! 🎉</h1>
					<p class="mt-2 text-muted-foreground">
						Akun Anda telah berhasil dibuat. Silakan login untuk melanjutkan.
					</p>
					<Button href="/auth/login" class="mt-6 w-full">Masuk Sekarang</Button>
				</div>
			{:else}
				<div class="mb-6 text-center">
					<h1 class="text-2xl font-bold text-foreground">Buat Akun Baru</h1>
					<p class="mt-2 text-muted-foreground">Pilih tipe akun dan isi data diri Anda</p>
				</div>

				<!-- Role Selection -->
				<div class="mb-6 grid grid-cols-2 gap-4">
					<button
						type="button"
						onclick={() => (role = 'supplier')}
						class="flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all {role ===
						'supplier'
							? 'border-primary bg-primary/10'
							: 'border-border hover:border-primary/50'}"
					>
						<div
							class="flex h-12 w-12 items-center justify-center rounded-full {role === 'supplier'
								? 'bg-primary text-primary-foreground'
								: 'bg-muted text-muted-foreground'}"
						>
							<User class="h-6 w-6" />
						</div>
						<span class="font-medium text-foreground">Penyetor</span>
						<span class="text-xs text-muted-foreground">Titip produk ke lapak</span>
					</button>

					<button
						type="button"
						onclick={() => (role = 'owner')}
						class="flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all {role ===
						'owner'
							? 'border-primary bg-primary/10'
							: 'border-border hover:border-primary/50'}"
					>
						<div
							class="flex h-12 w-12 items-center justify-center rounded-full {role === 'owner'
								? 'bg-primary text-primary-foreground'
								: 'bg-muted text-muted-foreground'}"
						>
							<Building2 class="h-6 w-6" />
						</div>
						<span class="font-medium text-foreground">Pemilik Lapak</span>
						<span class="text-xs text-muted-foreground">Kelola lapak sendiri</span>
					</button>
				</div>

				<!-- Register Form -->
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
					<input type="hidden" name="role" value={role} />

					<Input
						id="name"
						name="name"
						label="Nama Lengkap"
						placeholder="Masukkan nama lengkap (huruf saja)"
						required
						bind:value={name}
						error={nameError()}
					/>

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

					<Input
						id="confirmPin"
						name="confirmPin"
						type="password"
						label="Konfirmasi PIN"
						placeholder="Ulangi 6 digit PIN"
						minlength={6}
						maxlength={6}
						required
						bind:value={confirmPin}
						error={confirmPinError()}
						showPasswordToggle={true}
					/>

					{#if formError}
						<div class="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
							{formError}
						</div>
					{/if}

					<Button type="submit" class="w-full" disabled={!isFormValid || loading}>
						{#if loading}
							Mendaftar...
						{:else}
							Daftar Sekarang
						{/if}
					</Button>
				</form>

				<p class="mt-6 text-center text-sm text-muted-foreground">
					Sudah punya akun?
					<a href="/auth/login" class="font-medium text-primary hover:underline"> Masuk di sini </a>
				</p>
			{/if}
		</Card>
	</main>
</div>
