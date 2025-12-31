<script lang="ts">
	import { Card, Button, Input } from '$lib/components/ui';
	import { enhance } from '$app/forms';
	import {
		ArrowLeft,
		Store,
		Eye,
		EyeOff,
		Users,
		Link,
		Power,
		Trash2,
		Save,
		CheckCircle2,
		UserCheck,
		Phone,
		MapPin,
		Clock
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
	let showDeleteConfirm = $state(false);

	let formSuccess = $derived(form?.success || false);
	let formError = $derived(form?.error || '');
	let isFormValid = $derived(name.length >= 3 && name.length <= 50);

	// Update local state when data changes
	$effect(() => {
		visibility = data.store.visibility;
		autoApprove = data.store.autoApprove;
	});
</script>

<svelte:head>
	<title>{data.store.name} - Kelola Lapak - Mak Unyil</title>
</svelte:head>

<div class="mx-auto max-w-3xl space-y-6">
	<!-- Header -->
	<div class="flex items-start justify-between">
		<div>
			<a href="/admin/stores" class="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
				<ArrowLeft class="h-4 w-4" />
				Kembali ke Daftar Lapak
			</a>
			<h1 class="mt-4 text-2xl font-bold text-foreground">{data.store.name}</h1>
			<p class="text-muted-foreground">Kelola informasi dan pengaturan lapak</p>
		</div>
		<div class="flex items-center gap-2">
			<span class="rounded-full px-3 py-1 text-sm font-medium {data.store.isOpen ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}">
				{data.store.isOpen ? 'Buka' : 'Tutup'}
			</span>
		</div>
	</div>

	<!-- Quick Actions -->
	<div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
		<Button href="/admin/stores/{data.store.id}/members" variant="outline" class="h-auto flex-col gap-2 py-4">
			<Users class="h-5 w-5" />
			<span>Anggota ({data.store.memberCount})</span>
		</Button>
		<Button href="/admin/stores/{data.store.id}/invite" variant="outline" class="h-auto flex-col gap-2 py-4">
			<Link class="h-5 w-5" />
			<span>Undang Anggota</span>
		</Button>
		<form method="POST" action="?/toggleStatus" use:enhance class="contents">
			<Button type="submit" variant="outline" class="h-auto flex-col gap-2 py-4">
				<Power class="h-5 w-5" />
				<span>{data.store.isOpen ? 'Tutup Lapak' : 'Buka Lapak'}</span>
			</Button>
		</form>
		<Button onclick={() => (showDeleteConfirm = true)} variant="outline" class="h-auto flex-col gap-2 py-4 text-destructive hover:bg-destructive/10">
			<Trash2 class="h-5 w-5" />
			<span>Hapus Lapak</span>
		</Button>
	</div>

	<!-- Edit Form -->
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
		class="space-y-6"
	>
		<!-- Basic Info Card -->
		<Card>
			<h2 class="mb-4 text-lg font-semibold text-foreground">Informasi Dasar</h2>

			{#if formSuccess}
				<div class="mb-4 flex items-center gap-2 rounded-lg bg-green-100 p-3 text-sm text-green-700 dark:bg-green-900/30 dark:text-green-400">
					<CheckCircle2 class="h-4 w-4" />
					Perubahan berhasil disimpan
				</div>
			{/if}

			<div class="space-y-4">
				<Input
					id="name"
					name="name"
					label="Nama Lapak"
					required
					bind:value={name}
				/>

				<div class="space-y-2">
					<label for="description" class="text-sm font-medium text-foreground">Deskripsi</label>
					<textarea
						id="description"
						name="description"
						rows="3"
						class="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
						placeholder="Deskripsi singkat tentang lapak"
						bind:value={description}
					></textarea>
				</div>
			</div>
		</Card>

		<!-- Contact Info Card -->
		<Card>
			<h2 class="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
				<Phone class="h-5 w-5" />
				Informasi Kontak
			</h2>

			<div class="grid gap-4 sm:grid-cols-2">
				<Input
					id="phone"
					name="phone"
					label="Nomor HP Admin"
					type="tel"
					placeholder="08123456789"
					bind:value={phone}
				/>

				<div class="sm:col-span-2 space-y-2">
					<label for="address" class="text-sm font-medium text-foreground">Alamat Lapak</label>
					<textarea
						id="address"
						name="address"
						rows="2"
						class="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
						placeholder="Alamat lengkap lapak"
						bind:value={address}
					></textarea>
				</div>
			</div>
		</Card>

		<!-- Operating Hours Card -->
		<Card>
			<h2 class="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
				<Clock class="h-5 w-5" />
				Jam Operasional
			</h2>

			<div class="grid gap-4 sm:grid-cols-3">
				<Input
					id="operatingDays"
					name="operatingDays"
					label="Hari Buka"
					placeholder="Senin-Sabtu"
					bind:value={operatingDays}
				/>

				<Input
					id="openTime"
					name="openTime"
					label="Jam Buka"
					type="time"
					bind:value={openTime}
				/>

				<Input
					id="closeTime"
					name="closeTime"
					label="Jam Tutup"
					type="time"
					bind:value={closeTime}
				/>
			</div>
		</Card>

		<!-- Settings Card -->
		<Card>
			<h2 class="mb-4 text-lg font-semibold text-foreground">Pengaturan</h2>

			<div class="space-y-6">
				<!-- Visibility -->
				<div class="space-y-3">
					<label class="text-sm font-medium text-foreground">Visibilitas Lapak</label>
					<div class="grid grid-cols-2 gap-4">
						<button
							type="button"
							onclick={() => (visibility = 'private')}
							class="flex items-center gap-3 rounded-xl border-2 p-4 transition-all {visibility === 'private' ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}"
						>
							<div class="flex h-10 w-10 items-center justify-center rounded-full {visibility === 'private' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}">
								<EyeOff class="h-5 w-5" />
							</div>
							<div class="text-left">
								<span class="font-medium text-foreground">Privat</span>
								<p class="text-xs text-muted-foreground">Hanya via undangan</p>
							</div>
						</button>

						<button
							type="button"
							onclick={() => (visibility = 'public')}
							class="flex items-center gap-3 rounded-xl border-2 p-4 transition-all {visibility === 'public' ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}"
						>
							<div class="flex h-10 w-10 items-center justify-center rounded-full {visibility === 'public' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}">
								<Eye class="h-5 w-5" />
							</div>
							<div class="text-left">
								<span class="font-medium text-foreground">Publik</span>
								<p class="text-xs text-muted-foreground">Siapa saja bisa lihat</p>
							</div>
						</button>
					</div>
					<input type="hidden" name="visibility" value={visibility} />
				</div>

				<!-- Auto Approve Toggle -->
				<div class="flex items-center justify-between rounded-xl border border-border p-4">
					<div class="flex items-center gap-3">
						<UserCheck class="h-5 w-5 text-primary" />
						<div>
							<span class="font-medium text-foreground">Auto-Approve via Kode</span>
							<p class="text-xs text-muted-foreground">Anggota via invite code langsung disetujui</p>
						</div>
					</div>
					<button
						type="button"
						onclick={() => (autoApprove = !autoApprove)}
						class="relative h-6 w-11 rounded-full transition-colors {autoApprove ? 'bg-primary' : 'bg-muted'}"
					>
						<span class="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform {autoApprove ? 'translate-x-5' : 'translate-x-0'}"></span>
					</button>
					<input type="hidden" name="autoApprove" value={autoApprove.toString()} />
				</div>
			</div>
		</Card>

		{#if formError}
			<div class="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
				{formError}
			</div>
		{/if}

		<Button type="submit" class="w-full gap-2" disabled={!isFormValid || loading}>
			<Save class="h-4 w-4" />
			{loading ? 'Menyimpan...' : 'Simpan Semua Perubahan'}
		</Button>
	</form>
</div>

<!-- Delete Confirmation Modal -->
{#if showDeleteConfirm}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
		<Card class="w-full max-w-md">
			<h3 class="text-lg font-semibold text-foreground">Hapus Lapak?</h3>
			<p class="mt-2 text-muted-foreground">
				Tindakan ini tidak dapat dibatalkan. Semua data lapak termasuk produk dan transaksi akan dihapus permanen.
			</p>
			<div class="mt-6 flex gap-3">
				<Button onclick={() => (showDeleteConfirm = false)} variant="outline" class="flex-1">
					Batal
				</Button>
				<form method="POST" action="?/delete" class="flex-1">
					<Button type="submit" variant="destructive" class="w-full">
						Ya, Hapus
					</Button>
				</form>
			</div>
		</Card>
	</div>
{/if}
