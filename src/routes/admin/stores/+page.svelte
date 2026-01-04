<script lang="ts">
	import { Card, Button } from '$lib/components/ui';
	import { formatDate } from '$lib/utils';
	import {
		Store,
		Plus,
		Users,
		Clock,
		Settings,
		Eye,
		EyeOff,
		Link,
		Package,
		FileText,
		MapPin
	} from 'lucide-svelte';

	let { data } = $props();

	function getStatusColor(isOpen: boolean) {
		return isOpen
			? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
			: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
	}
</script>

<svelte:head>
	<title>Kelola Lapak - Admin - Mak Unyil</title>
</svelte:head>

<div class="space-y-6">
	<!-- Header with Gradient -->
	<div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-background p-6">
		<div class="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/10 blur-2xl"></div>
		<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
			<div class="flex items-center gap-4">
				<div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/20 backdrop-blur-sm">
					<Store class="h-7 w-7 text-primary" />
				</div>
				<div>
					<h1 class="text-2xl font-bold text-foreground">Kelola Lapak</h1>
					<p class="text-muted-foreground">Kelola semua lapak Anda di sini</p>
				</div>
			</div>
			<Button href="/admin/stores/new" class="gap-2 rounded-xl shadow-lg shadow-primary/25">
				<Plus class="h-4 w-4" />
				Buat Lapak Baru
			</Button>
		</div>
	</div>

	<!-- Stores Grid -->
	{#if data.stores.length === 0}
		<div class="rounded-2xl border border-dashed border-border bg-muted/30 p-12 text-center">
			<div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
				<Store class="h-8 w-8 text-muted-foreground" />
			</div>
			<h2 class="text-lg font-semibold text-foreground">Belum ada lapak</h2>
			<p class="mt-2 text-muted-foreground">Buat lapak pertama Anda untuk mulai menerima penyetor</p>
			<Button href="/admin/stores/new" class="mt-4 gap-2 rounded-xl">
				<Plus class="h-4 w-4" />
				Buat Lapak Pertama
			</Button>
		</div>
	{:else}
		<div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
			{#each data.stores as store}
				<div class="group rounded-2xl border border-border bg-card overflow-hidden shadow-sm transition-all hover:shadow-md hover:border-primary/30">
					<!-- Header -->
					<div class="p-4 pb-3">
						<div class="flex items-start justify-between">
							<div class="flex items-center gap-3">
								<div class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10">
									<Store class="h-6 w-6 text-primary" />
								</div>
								<div class="min-w-0">
									<h3 class="truncate font-semibold text-foreground">{store.name}</h3>
									<div class="flex items-center gap-2 text-xs text-muted-foreground">
										{#if store.visibility === 'public'}
											<Eye class="h-3 w-3" />
											<span>Publik</span>
										{:else}
											<EyeOff class="h-3 w-3" />
											<span>Privat</span>
										{/if}
									</div>
								</div>
							</div>
							<span class="rounded-full px-2.5 py-1 text-xs font-medium {getStatusColor(store.isOpen)}">
								{store.isOpen ? 'Buka' : 'Tutup'}
							</span>
						</div>
					</div>

					<!-- Stats -->
					<div class="px-4 pb-3">
						<div class="grid grid-cols-2 gap-3">
							<div class="rounded-xl bg-muted/50 p-3">
								<div class="flex items-center gap-2 text-xs text-muted-foreground">
									<Users class="h-3.5 w-3.5" />
									<span>Anggota</span>
								</div>
								<p class="mt-1 text-lg font-bold text-foreground">{store.memberCount}</p>
							</div>
							<div class="rounded-xl bg-muted/50 p-3">
								<div class="flex items-center gap-2 text-xs text-muted-foreground">
									<Clock class="h-3.5 w-3.5" />
									<span>Pending</span>
								</div>
								<p class="mt-1 text-lg font-bold text-foreground">{store.pendingCount}</p>
							</div>
						</div>
					</div>

					<!-- Actions -->
					<div class="border-t border-border p-3">
						<div class="grid grid-cols-3 gap-2">
							<a
								href="/admin/stores/{store.id}"
								class="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-background py-2 text-xs font-medium text-foreground transition-all hover:border-primary hover:bg-primary/5"
								title="Kelola Lapak"
							>
								<Settings class="h-4 w-4 text-primary" />
								<span class="hidden sm:inline">Kelola</span>
							</a>
							<a
								href="/admin/stores/{store.id}/members"
								class="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-background py-2 text-xs font-medium text-foreground transition-all hover:border-primary hover:bg-primary/5"
								title="Kelola Anggota"
							>
								<Users class="h-4 w-4 text-primary" />
								<span class="hidden sm:inline">Anggota</span>
							</a>
							<a
								href="/admin/stores/{store.id}/invite"
								class="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-background py-2 text-xs font-medium text-foreground transition-all hover:border-primary hover:bg-primary/5"
								title="Kode Undangan"
							>
								<Link class="h-4 w-4 text-primary" />
								<span class="hidden sm:inline">Invite</span>
							</a>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
