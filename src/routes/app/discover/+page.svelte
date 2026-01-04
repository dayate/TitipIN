<script lang="ts">
	import { Card, Button } from '$lib/components/ui';
	import { enhance } from '$app/forms';
	import {
		Store, Search, Link, ChevronDown, ChevronUp, Eye, Users, Clock, CheckCircle2, ArrowRight
	} from 'lucide-svelte';

	let { data, form } = $props();

	// State for search and join
	let searchQuery = $state('');
	let joinCodeOpen = $state(false);
	let joinCode = $state('');
	let joinLoading = $state(false);

	// Derived states
	let joinError = $derived(form?.joinError || '');
	let joinSuccess = $derived(form?.joinSuccess || false);
	let joinStoreName = $derived(form?.storeName || '');

	// Filtered discover stores
	let filteredStores = $derived(
		data.discoverStores.filter(store =>
			store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			(store.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
		)
	);
</script>

<svelte:head>
	<title>Temukan Lapak - Mak Unyil</title>
</svelte:head>

<div class="space-y-6">
	<!-- Header with Gradient -->
	<div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-background p-6">
		<div class="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/10 blur-2xl"></div>
		<div class="flex items-center gap-4">
			<div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/20 backdrop-blur-sm">
				<Search class="h-7 w-7 text-primary" />
			</div>
			<div>
				<h1 class="text-2xl font-bold text-foreground">Temukan Lapak</h1>
				<p class="text-muted-foreground">Cari lapak publik atau gabung dengan kode undangan</p>
			</div>
		</div>
	</div>

	<!-- Search and Join Code Section -->
	<div class="space-y-3">
		<!-- Search Input -->
		<div class="relative">
			<Search class="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
			<input
				type="text"
				placeholder="Cari nama lapak..."
				bind:value={searchQuery}
				class="w-full rounded-xl border border-border bg-background py-3 pl-12 pr-4 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
			/>
		</div>

		<!-- Join with Code Collapsible -->
		<div class="rounded-xl border border-border bg-card overflow-hidden">
			<button
				type="button"
				onclick={() => joinCodeOpen = !joinCodeOpen}
				class="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-muted/50 transition-colors"
			>
				<div class="flex items-center gap-3">
					<div class="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
						<Link class="h-4 w-4 text-primary" />
					</div>
					<div>
						<p class="text-sm font-medium text-foreground">Punya kode undangan?</p>
						<p class="text-xs text-muted-foreground">Gabung langsung ke lapak privat</p>
					</div>
				</div>
				{#if joinCodeOpen}
					<ChevronUp class="h-5 w-5 text-muted-foreground" />
				{:else}
					<ChevronDown class="h-5 w-5 text-muted-foreground" />
				{/if}
			</button>

			{#if joinCodeOpen}
				<div class="border-t border-border p-4">
					{#if joinSuccess}
						<div class="rounded-xl bg-green-500/10 border border-green-500/20 p-4 text-center">
							<CheckCircle2 class="mx-auto h-8 w-8 text-green-600 dark:text-green-400" />
							<p class="mt-2 text-sm font-medium text-green-600 dark:text-green-400">Berhasil bergabung ke {joinStoreName}! 🎉</p>
							<a href="/app/stores" class="mt-3 inline-flex items-center gap-2 text-sm text-primary hover:underline">
								Lihat Lapak Saya <ArrowRight class="h-4 w-4" />
							</a>
						</div>
					{:else}
						<form
							method="POST"
							action="?/joinWithCode"
							use:enhance={() => {
								joinLoading = true;
								return async ({ update }) => {
									joinLoading = false;
									await update();
								};
							}}
							class="flex gap-3"
						>
							<input
								name="code"
								type="text"
								placeholder="Masukkan kode..."
								bind:value={joinCode}
								class="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium uppercase tracking-widest text-center focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
							/>
							<Button type="submit" disabled={joinCode.length < 6 || joinLoading} class="gap-2 rounded-xl px-6">
								{#if joinLoading}
									Memproses...
								{:else}
									Gabung
								{/if}
							</Button>
						</form>
						{#if joinError}
							<p class="mt-2 text-sm text-destructive">{joinError}</p>
						{/if}
					{/if}
				</div>
			{/if}
		</div>
	</div>

	<!-- Public Stores Grid -->
	<div>
		<h2 class="text-lg font-semibold text-foreground mb-4">Lapak Publik</h2>

		{#if filteredStores.length > 0}
			<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{#each filteredStores as store}
					<div class="group rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:shadow-md hover:border-primary/30">
						<!-- Header -->
						<div class="flex items-center justify-between mb-3">
							<span class="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-1 text-xs font-medium text-primary">
								<Eye class="h-3 w-3" />
								Publik
							</span>
							<span class={`text-xs font-medium ${store.isOpen ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
								{store.isOpen ? '● Buka' : '● Tutup'}
							</span>
						</div>

						<!-- Store Info -->
						<div class="flex items-center gap-3 mb-3">
							<div class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
								<Store class="h-5 w-5 text-primary" />
							</div>
							<div class="min-w-0 flex-1">
								<h3 class="font-semibold text-foreground truncate">{store.name}</h3>
								<div class="flex items-center gap-2 text-xs text-muted-foreground">
									<Users class="h-3 w-3" />
									<span>{store.memberCount} anggota</span>
									{#if store.openTime}
										<span>•</span>
										<Clock class="h-3 w-3" />
										<span>{store.openTime} - {store.closeTime}</span>
									{/if}
								</div>
							</div>
						</div>

						{#if store.description}
							<p class="line-clamp-2 text-sm text-muted-foreground mb-4">{store.description}</p>
						{/if}

						<a
							href="/app/stores/{store.id}/join"
							class="flex items-center justify-center gap-2 w-full rounded-xl bg-primary/10 py-2.5 text-sm font-medium text-primary hover:bg-primary/20 transition-colors"
						>
							<Users class="h-4 w-4" />
							Minta Bergabung
						</a>
					</div>
				{/each}
			</div>
		{:else if searchQuery}
			<div class="rounded-2xl border border-dashed border-border bg-muted/30 p-8 text-center">
				<Search class="mx-auto h-8 w-8 text-muted-foreground" />
				<p class="mt-2 text-muted-foreground">Tidak ada lapak dengan nama "{searchQuery}"</p>
			</div>
		{:else}
			<div class="rounded-2xl border border-dashed border-border bg-muted/30 p-8 text-center">
				<Store class="mx-auto h-8 w-8 text-muted-foreground" />
				<p class="mt-2 text-muted-foreground">Belum ada lapak publik yang tersedia</p>
				<p class="text-sm text-muted-foreground mt-1">Gunakan kode undangan untuk bergabung ke lapak privat</p>
			</div>
		{/if}
	</div>
</div>
