<script lang="ts">
	import { Card, Button, Input } from '$lib/components/ui';
	import { ArrowLeft, Store, Eye, EyeOff } from 'lucide-svelte';
	import { enhance } from '$app/forms';

	let { form } = $props();

	let name = $state('');
	let description = $state('');
	let visibility = $state<'private' | 'public'>('private');
	let loading = $state(false);

	let formError = $derived(form?.error || '');
	let isFormValid = $derived(name.length >= 3 && name.length <= 50);
</script>

<svelte:head>
	<title>Buat Lapak Baru - Admin - Mak Unyil</title>
</svelte:head>

<div class="mx-auto max-w-2xl space-y-6">
	<!-- Header -->
	<div>
		<a href="/admin/stores" class="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
			<ArrowLeft class="h-4 w-4" />
			Kembali ke Daftar Lapak
		</a>
		<h1 class="mt-4 text-2xl font-bold text-foreground">Buat Lapak Baru</h1>
		<p class="text-muted-foreground">Isi informasi lapak yang ingin Anda buat</p>
	</div>

	<!-- Form -->
	<Card>
		<form
			method="POST"
			use:enhance={() => {
				loading = true;
				return async ({ update }) => {
					loading = false;
					await update();
				};
			}}
			class="space-y-6"
		>
			<Input
				id="name"
				name="name"
				label="Nama Lapak"
				placeholder="Contoh: Lapak Ibu Siti"
				required
				bind:value={name}
				error={name.length > 0 && name.length < 3 ? 'Minimal 3 karakter' : ''}
			/>

			<div class="space-y-2">
				<label for="description" class="text-sm font-medium text-foreground">
					Deskripsi (Opsional)
				</label>
				<textarea
					id="description"
					name="description"
					rows="3"
					class="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
					placeholder="Deskripsi singkat tentang lapak Anda"
					bind:value={description}
				></textarea>
			</div>

			<!-- Visibility -->
			<div class="space-y-3">
				<label class="text-sm font-medium text-foreground">Visibilitas Lapak</label>
				<div class="grid grid-cols-2 gap-4">
					<button
						type="button"
						onclick={() => (visibility = 'private')}
						class="flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all {visibility === 'private' ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}"
					>
						<div class="flex h-12 w-12 items-center justify-center rounded-full {visibility === 'private' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}">
							<EyeOff class="h-6 w-6" />
						</div>
						<span class="font-medium text-foreground">Privat</span>
						<span class="text-center text-xs text-muted-foreground">Hanya anggota yang dapat melihat</span>
					</button>

					<button
						type="button"
						onclick={() => (visibility = 'public')}
						class="flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all {visibility === 'public' ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}"
					>
						<div class="flex h-12 w-12 items-center justify-center rounded-full {visibility === 'public' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}">
							<Eye class="h-6 w-6" />
						</div>
						<span class="font-medium text-foreground">Publik</span>
						<span class="text-center text-xs text-muted-foreground">Semua orang dapat melihat</span>
					</button>
				</div>
				<input type="hidden" name="visibility" value={visibility} />
			</div>

			{#if formError}
				<div class="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
					{formError}
				</div>
			{/if}

			<div class="flex gap-3">
				<Button href="/admin/stores" variant="outline" class="flex-1">
					Batal
				</Button>
				<Button type="submit" class="flex-1" disabled={!isFormValid || loading}>
					{#if loading}
						Membuat...
					{:else}
						Buat Lapak
					{/if}
				</Button>
			</div>
		</form>
	</Card>
</div>
