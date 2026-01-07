<script lang="ts">
	import { Card, Button, Input } from '$lib/components/ui';
	import { enhance } from '$app/forms';
	import { ArrowLeft, Link, Copy, RefreshCw, Clock, CheckCircle2, QrCode } from 'lucide-svelte';

	let { data } = $props();

	let expiresIn = $state('168'); // 7 days
	let copied = $state(false);
	let loading = $state(false);

	let inviteUrl = $derived(
		data.activeInvite ? `${data.baseUrl}/join/${data.activeInvite.code}` : ''
	);

	let expiresLabel = $derived(() => {
		if (!data.activeInvite) return '';
		const diff = data.activeInvite.expiresAt.getTime() - Date.now();
		const hours = Math.floor(diff / (1000 * 60 * 60));
		const days = Math.floor(hours / 24);
		if (days > 0) return `${days} hari`;
		if (hours > 0) return `${hours} jam`;
		return 'Segera kadaluarsa';
	});

	async function copyToClipboard() {
		if (!inviteUrl) return;
		try {
			await navigator.clipboard.writeText(inviteUrl);
			copied = true;
			setTimeout(() => (copied = false), 2000);
		} catch (err) {
			console.error('Failed to copy:', err);
		}
	}
</script>

<svelte:head>
	<title>Undang Anggota - {data.store.name} - Mak Unyil</title>
</svelte:head>

<div class="mx-auto max-w-2xl space-y-6">
	<!-- Header -->
	<div>
		<a
			href="/admin/stores/{data.store.id}"
			class="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
		>
			<ArrowLeft class="h-4 w-4" />
			Kembali ke {data.store.name}
		</a>
		<h1 class="mt-4 text-2xl font-bold text-foreground">Undang Anggota</h1>
		<p class="text-muted-foreground">Bagikan link atau kode undangan untuk mengajak anggota baru</p>
	</div>

	<!-- Active Invite Code -->
	{#if data.activeInvite}
		<Card>
			<div class="mb-4 flex items-center justify-between">
				<h2 class="text-lg font-semibold text-foreground">Kode Undangan Aktif</h2>
				<div class="flex items-center gap-2 text-sm text-muted-foreground">
					<Clock class="h-4 w-4" />
					<span>Berlaku {expiresLabel()}</span>
				</div>
			</div>

			<!-- Code Display -->
			<div class="mb-4 flex items-center gap-2 rounded-lg bg-muted p-4">
				<code class="flex-1 text-center text-2xl font-bold tracking-widest text-primary">
					{data.activeInvite.code}
				</code>
			</div>

			<!-- URL Display -->
			<div class="mb-4">
				<label class="mb-2 block text-sm font-medium text-foreground">Link Undangan</label>
				<div class="flex gap-2">
					<input
						type="text"
						readonly
						value={inviteUrl}
						class="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground"
					/>
					<Button onclick={copyToClipboard} variant="outline" class="gap-2">
						{#if copied}
							<CheckCircle2 class="h-4 w-4 text-green-600" />
							Tersalin
						{:else}
							<Copy class="h-4 w-4" />
							Salin
						{/if}
					</Button>
				</div>
			</div>

			<!-- Stats -->
			<div class="flex items-center justify-between rounded-lg bg-muted p-3 text-sm">
				<span class="text-muted-foreground">Digunakan</span>
				<span class="font-medium text-foreground">{data.activeInvite.usedCount} kali</span>
			</div>
		</Card>
	{/if}

	<!-- Generate New Code -->
	<Card>
		<h2 class="mb-4 text-lg font-semibold text-foreground">
			{data.activeInvite ? 'Buat Kode Baru' : 'Buat Kode Undangan'}
		</h2>
		<p class="mb-4 text-sm text-muted-foreground">
			{data.activeInvite
				? 'Membuat kode baru akan menonaktifkan kode sebelumnya.'
				: 'Buat kode undangan untuk mengajak anggota baru ke lapak Anda.'}
		</p>

		<form
			method="POST"
			action="?/generate"
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
				<label for="expiresIn" class="text-sm font-medium text-foreground">Masa Berlaku</label>
				<select
					id="expiresIn"
					name="expiresIn"
					bind:value={expiresIn}
					class="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
				>
					<option value="24">1 Hari</option>
					<option value="72">3 Hari</option>
					<option value="168">7 Hari</option>
					<option value="720">30 Hari</option>
				</select>
			</div>

			<Button type="submit" class="w-full gap-2" disabled={loading}>
				<RefreshCw class="h-4 w-4" />
				{loading ? 'Membuat...' : data.activeInvite ? 'Generate Kode Baru' : 'Buat Kode Undangan'}
			</Button>
		</form>
	</Card>

	<!-- Instructions -->
	<Card class="bg-muted/50">
		<h3 class="mb-2 font-medium text-foreground">Cara Bergabung</h3>
		<ol class="space-y-2 text-sm text-muted-foreground">
			<li>1. Bagikan <strong>link undangan</strong> atau <strong>kode</strong> ke calon anggota</li>
			<li>2. Anggota membuka link atau memasukkan kode di aplikasi</li>
			<li>
				3. Anda akan menerima notifikasi untuk <strong>menyetujui</strong> permintaan bergabung
			</li>
			<li>4. Setelah disetujui, anggota bisa mulai menyetor produk</li>
		</ol>
	</Card>
</div>
