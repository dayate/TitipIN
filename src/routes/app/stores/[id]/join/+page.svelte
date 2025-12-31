<script lang="ts">
	import { Card, Button, Input } from '$lib/components/ui';
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import {
		ArrowLeft,
		Store,
		CheckCircle2,
		Clock,
		MapPin,
		Phone,
		Users,
		Key,
		FileText
	} from 'lucide-svelte';

	let { data, form } = $props();

	let message = $state('');
	let loading = $state(false);

	let formError = $derived(form?.error || '');
	let formSuccess = $derived(form?.success || false);
	let isLoggedIn = $derived($page.data.user != null);
	let isFormValid = $derived(message.length >= 10);
</script>

<svelte:head>
	<title>Gabung {data.store.name} - Mak Unyil</title>
</svelte:head>

<div class="space-y-6">
	<!-- Header -->
	<div>
		<a href="/app/stores" class="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
			<ArrowLeft class="h-4 w-4" />
			Kembali
		</a>
	</div>

	{#if formSuccess}
		<!-- Success State -->
		<Card class="text-center py-12">
			<div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
				<CheckCircle2 class="h-8 w-8 text-green-600 dark:text-green-400" />
			</div>
			<h1 class="text-2xl font-bold text-foreground">Permintaan Terkirim! 🎉</h1>
			<p class="mt-2 text-muted-foreground">
				Permintaan bergabung ke <strong>{data.store.name}</strong> telah dikirim.
				Tunggu persetujuan dari pemilik lapak.
			</p>
			<Button href="/app/stores" class="mt-6">
				Lihat Lapak Saya
			</Button>
		</Card>

	{:else if data.existingMember}
		<!-- Already member -->
		<Card class="text-center py-12">
			<div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30">
				<Clock class="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
			</div>
			{#if data.existingMember.status === 'active'}
				<h1 class="text-2xl font-bold text-foreground">Anda Sudah Anggota</h1>
				<p class="mt-2 text-muted-foreground">
					Anda sudah menjadi anggota <strong>{data.store.name}</strong>.
				</p>
				<Button href="/app/setor?store={data.store.id}" class="mt-6">
					Setor Produk
				</Button>
			{:else if data.existingMember.status === 'pending'}
				<h1 class="text-2xl font-bold text-foreground">Menunggu Persetujuan</h1>
				<p class="mt-2 text-muted-foreground">
					Permintaan Anda untuk bergabung ke <strong>{data.store.name}</strong> sedang menunggu persetujuan.
				</p>
				<Button href="/app/stores" class="mt-6" variant="outline">
					Kembali
				</Button>
			{/if}
		</Card>

	{:else}
		<!-- Store Info -->
		<Card>
			<div class="flex items-start gap-4">
				<div class="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-primary/10">
					<Store class="h-8 w-8 text-primary" />
				</div>
				<div class="flex-1">
					<h1 class="text-2xl font-bold text-foreground">{data.store.name}</h1>
					{#if data.store.description}
						<p class="mt-1 text-muted-foreground">{data.store.description}</p>
					{/if}
				</div>
			</div>

			<!-- Store Details -->
			<div class="mt-6 grid gap-3 sm:grid-cols-2">
				{#if data.store.address}
					<div class="flex items-center gap-2 text-sm text-muted-foreground">
						<MapPin class="h-4 w-4" />
						<span>{data.store.address}</span>
					</div>
				{/if}
				{#if data.store.phone}
					<div class="flex items-center gap-2 text-sm text-muted-foreground">
						<Phone class="h-4 w-4" />
						<span>{data.store.phone}</span>
					</div>
				{/if}
				{#if data.store.operatingDays}
					<div class="flex items-center gap-2 text-sm text-muted-foreground">
						<Clock class="h-4 w-4" />
						<span>{data.store.operatingDays}, {data.store.openTime} - {data.store.closeTime}</span>
					</div>
				{/if}
			</div>
		</Card>

		<!-- Join Options -->
		<div class="grid gap-4 sm:grid-cols-2">
			<!-- Option 1: Request Form -->
			<Card class="relative">
				<div class="absolute -top-3 left-4">
					<span class="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
						Opsi 1
					</span>
				</div>

				<div class="mb-4 flex items-center gap-3">
					<div class="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
						<FileText class="h-5 w-5 text-primary" />
					</div>
					<div>
						<h2 class="font-semibold text-foreground">Kirim Permintaan</h2>
						<p class="text-xs text-muted-foreground">Isi form dan tunggu persetujuan</p>
					</div>
				</div>

				{#if !isLoggedIn}
					<p class="mb-4 text-sm text-muted-foreground">Silakan login untuk melanjutkan</p>
					<Button href="/auth/login?redirect=/app/stores/{data.store.id}/join" class="w-full">
						Login untuk Bergabung
					</Button>
				{:else}
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
							<label for="message" class="text-sm font-medium text-foreground">
								Pesan Permohonan <span class="text-destructive">*</span>
							</label>
							<textarea
								id="message"
								name="message"
								rows="3"
								required
								minlength="10"
								class="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
								placeholder="Perkenalkan diri Anda dan jelaskan mengapa ingin bergabung..."
								bind:value={message}
							></textarea>
							<p class="text-xs text-muted-foreground">{message.length}/10 karakter minimum</p>
						</div>

						{#if formError}
							<div class="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
								{formError}
							</div>
						{/if}

						<Button type="submit" class="w-full" disabled={!isFormValid || loading}>
							{loading ? 'Mengirim...' : 'Kirim Permintaan'}
						</Button>
					</form>
				{/if}
			</Card>

			<!-- Option 2: Invite Code -->
			<Card class="relative">
				<div class="absolute -top-3 left-4">
					<span class="rounded-full bg-muted px-3 py-1 text-xs font-medium text-foreground">
						Opsi 2
					</span>
				</div>

				<div class="mb-4 flex items-center gap-3">
					<div class="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
						<Key class="h-5 w-5 text-muted-foreground" />
					</div>
					<div>
						<h2 class="font-semibold text-foreground">Pakai Kode Undangan</h2>
						<p class="text-xs text-muted-foreground">Lebih cepat jika sudah punya kode</p>
					</div>
				</div>

				<p class="mb-4 text-sm text-muted-foreground">
					Jika Anda sudah memiliki kode undangan dari pemilik lapak, gunakan kode tersebut untuk bergabung lebih cepat.
				</p>

				<Button href="/app/join" variant="outline" class="w-full gap-2">
					<Key class="h-4 w-4" />
					Masukkan Kode Undangan
				</Button>
			</Card>
		</div>
	{/if}
</div>
