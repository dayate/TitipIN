<script lang="ts">
	import { Card, Button, Input } from '$lib/components/ui';
	import { enhance } from '$app/forms';
	import {
		ArrowLeft,
		Save,
		CheckCircle2,
		Store,
		Clock,
		Phone,
		MapPin,
		Eye,
		EyeOff,
		UserCheck,
		Settings,
		Globe,
		Lock,
		Check
	} from 'lucide-svelte';

	let { data, form } = $props();

	let name = $state(data.store.name);
	let description = $state(data.store.description || '');
	let phone = $state(data.store.phone || '');
	let address = $state(data.store.address || '');
	let operatingDays = $state(data.store.operatingDays || 'Senin-Sabtu');
	let openTime = $state(data.store.openTime || '04:00');
	let closeTime = $state(data.store.closeTime || '08:00');
	let visibility = $state<'private' | 'public'>(data.store.visibility);
	let autoApprove = $state(data.store.autoApprove);
	let loading = $state(false);

	let formSuccess = $derived(form?.success || false);
	let formError = $derived(form?.error || '');
</script>

<svelte:head>
	<title>Pengaturan - {data.store.name} - Mak Unyil</title>
</svelte:head>

<div class="mx-auto max-w-2xl space-y-6">
	<!-- Header -->
	<div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-background p-6">
		<div class="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/10 blur-2xl"></div>
		<a
			href="/admin/stores/{data.store.id}"
			class="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
		>
			<ArrowLeft class="h-4 w-4" />
			Kembali
		</a>
		<div class="flex items-center gap-4">
			<div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/20 backdrop-blur-sm">
				<Settings class="h-7 w-7 text-primary" />
			</div>
			<div>
				<h1 class="text-2xl font-bold text-foreground">Pengaturan</h1>
				<p class="text-muted-foreground">{data.store.name}</p>
			</div>
		</div>
	</div>

	<!-- Form -->
	<form
		method="POST"
		action="?/update"
		use:enhance={() => {
			loading = true;
			return async ({ update }) => {
				loading = false;
				await update();
			};
		}}
		class="space-y-5"
	>
		<!-- Success / Error Messages -->
		{#if formSuccess}
			<div class="flex items-center gap-3 rounded-xl bg-green-500/10 border border-green-500/20 p-4 text-green-600 dark:text-green-400">
				<div class="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/20">
					<CheckCircle2 class="h-4 w-4" />
				</div>
				<span class="font-medium">Pengaturan berhasil disimpan!</span>
			</div>
		{/if}
		{#if formError}
			<div class="rounded-xl bg-destructive/10 border border-destructive/20 p-4 text-destructive">
				{formError}
			</div>
		{/if}

		<!-- Basic Info -->
		<div class="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-sm">
			<div class="flex items-center gap-3 pb-3 border-b border-border">
				<div class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
					<Store class="h-5 w-5 text-primary" />
				</div>
				<h2 class="text-lg font-semibold text-foreground">Informasi Dasar</h2>
			</div>
			<div class="space-y-4">
				<div class="space-y-2">
					<label for="name" class="text-sm font-medium text-foreground">Nama Lapak</label>
					<input
						id="name"
						name="name"
						type="text"
						bind:value={name}
						required
						class="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
					/>
				</div>
				<div class="space-y-2">
					<label for="description" class="text-sm font-medium text-foreground">Deskripsi</label>
					<textarea
						id="description"
						name="description"
						rows="3"
						bind:value={description}
						class="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none resize-none"
						placeholder="Deskripsi singkat tentang lapak..."
					></textarea>
				</div>
			</div>
		</div>

		<!-- Operating Hours -->
		<div class="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-sm">
			<div class="flex items-center gap-3 pb-3 border-b border-border">
				<div class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
					<Clock class="h-5 w-5 text-primary" />
				</div>
				<h2 class="text-lg font-semibold text-foreground">Jam Operasional</h2>
			</div>
			<div class="space-y-4">
				<div class="space-y-2">
					<label for="operatingDays" class="text-sm font-medium text-foreground">Hari Operasional</label>
					<input
						id="operatingDays"
						name="operatingDays"
						type="text"
						bind:value={operatingDays}
						placeholder="Senin-Sabtu"
						class="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
					/>
				</div>
				<div class="grid grid-cols-2 gap-4">
					<div class="space-y-2">
						<label for="openTime" class="text-sm font-medium text-foreground">Jam Buka</label>
						<input
							id="openTime"
							name="openTime"
							type="time"
							bind:value={openTime}
							class="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
						/>
					</div>
					<div class="space-y-2">
						<label for="closeTime" class="text-sm font-medium text-foreground">Jam Tutup</label>
						<input
							id="closeTime"
							name="closeTime"
							type="time"
							bind:value={closeTime}
							class="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
						/>
					</div>
				</div>
			</div>
		</div>

		<!-- Contact Info -->
		<div class="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-sm">
			<div class="flex items-center gap-3 pb-3 border-b border-border">
				<div class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
					<Phone class="h-5 w-5 text-primary" />
				</div>
				<h2 class="text-lg font-semibold text-foreground">Kontak</h2>
			</div>
			<div class="space-y-4">
				<div class="space-y-2">
					<label for="phone" class="text-sm font-medium text-foreground">Nomor Telepon</label>
					<input
						id="phone"
						name="phone"
						type="text"
						bind:value={phone}
						placeholder="08xxxxxxxxxx"
						class="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
					/>
				</div>
				<div class="space-y-2">
					<label for="address" class="text-sm font-medium text-foreground">Alamat</label>
					<textarea
						id="address"
						name="address"
						rows="2"
						bind:value={address}
						class="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none resize-none"
						placeholder="Alamat lengkap lapak..."
					></textarea>
				</div>
			</div>
		</div>

		<!-- Advanced Settings -->
		<div class="rounded-2xl border border-border bg-card p-5 space-y-5 shadow-sm">
			<div class="flex items-center gap-3 pb-3 border-b border-border">
				<div class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
					<Settings class="h-5 w-5 text-primary" />
				</div>
				<h2 class="text-lg font-semibold text-foreground">Pengaturan Lanjutan</h2>
			</div>

			<!-- Visibility Toggle -->
			<div class="space-y-3">
				<p class="text-sm font-medium text-foreground">Visibilitas Lapak</p>
				<div class="grid grid-cols-2 gap-3">
					<!-- Public Option -->
					<button
						type="button"
						onclick={() => visibility = 'public'}
						class="relative flex flex-col items-center gap-3 rounded-2xl border-2 p-5 transition-all duration-200 {visibility === 'public'
							? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
							: 'border-border bg-background hover:border-muted-foreground/30 hover:bg-muted/50'}"
					>
						{#if visibility === 'public'}
							<div class="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
								<Check class="h-3.5 w-3.5" />
							</div>
						{/if}
						<div class="flex h-12 w-12 items-center justify-center rounded-xl {visibility === 'public' ? 'bg-primary/20' : 'bg-muted'}">
							<Globe class="h-6 w-6 {visibility === 'public' ? 'text-primary' : 'text-muted-foreground'}" />
						</div>
						<div class="text-center">
							<p class="font-semibold {visibility === 'public' ? 'text-primary' : 'text-foreground'}">Publik</p>
							<p class="text-xs text-muted-foreground">Dapat ditemukan</p>
						</div>
					</button>
					<input type="hidden" name="visibility" value={visibility} />

					<!-- Private Option -->
					<button
						type="button"
						onclick={() => visibility = 'private'}
						class="relative flex flex-col items-center gap-3 rounded-2xl border-2 p-5 transition-all duration-200 {visibility === 'private'
							? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
							: 'border-border bg-background hover:border-muted-foreground/30 hover:bg-muted/50'}"
					>
						{#if visibility === 'private'}
							<div class="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
								<Check class="h-3.5 w-3.5" />
							</div>
						{/if}
						<div class="flex h-12 w-12 items-center justify-center rounded-xl {visibility === 'private' ? 'bg-primary/20' : 'bg-muted'}">
							<Lock class="h-6 w-6 {visibility === 'private' ? 'text-primary' : 'text-muted-foreground'}" />
						</div>
						<div class="text-center">
							<p class="font-semibold {visibility === 'private' ? 'text-primary' : 'text-foreground'}">Privat</p>
							<p class="text-xs text-muted-foreground">Hanya via undangan</p>
						</div>
					</button>
				</div>
			</div>

			<!-- Auto Approve Toggle -->
			<div class="flex items-center justify-between rounded-xl bg-muted/50 p-4">
				<div class="flex items-center gap-3">
					<div class="flex h-10 w-10 items-center justify-center rounded-xl bg-background">
						<UserCheck class="h-5 w-5 text-muted-foreground" />
					</div>
					<div>
						<p class="font-medium text-foreground">Auto-Approve</p>
						<p class="text-xs text-muted-foreground">Setujui member otomatis</p>
					</div>
				</div>
				<button
					type="button"
					onclick={() => autoApprove = !autoApprove}
					class="relative h-7 w-12 rounded-full transition-colors duration-200 {autoApprove ? 'bg-primary' : 'bg-muted'}"
				>
					<input type="hidden" name="autoApprove" value={autoApprove ? 'true' : 'false'} />
					<span
						class="absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow-md transition-transform duration-200 {autoApprove ? 'translate-x-5' : 'translate-x-0'}"
					></span>
				</button>
			</div>
		</div>

		<!-- Submit Button -->
		<button
			type="submit"
			disabled={loading}
			class="w-full flex items-center justify-center gap-2 rounded-2xl bg-primary py-4 font-semibold text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 disabled:opacity-50 transition-all duration-200"
		>
			{#if loading}
				<div class="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground"></div>
				Menyimpan...
			{:else}
				<Save class="h-5 w-5" />
				Simpan Pengaturan
			{/if}
		</button>
	</form>
</div>
