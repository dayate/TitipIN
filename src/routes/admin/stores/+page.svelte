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
		MoreVertical,
		Edit,
		Trash2,
		Link,
		UserPlus
	} from 'lucide-svelte';

	let { data } = $props();

	function getStatusColor(isOpen: boolean) {
		return isOpen
			? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
			: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
	}

	function getVisibilityIcon(visibility: string) {
		return visibility === 'public' ? Eye : EyeOff;
	}
</script>

<svelte:head>
	<title>Kelola Lapak - Admin - Mak Unyil</title>
</svelte:head>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<div>
			<h1 class="text-2xl font-bold text-foreground">Kelola Lapak</h1>
			<p class="text-muted-foreground">Kelola semua lapak Anda di sini</p>
		</div>
		<Button href="/admin/stores/new" class="gap-2">
			<Plus class="h-4 w-4" />
			Buat Lapak Baru
		</Button>
	</div>

	<!-- Stores Grid -->
	{#if data.stores.length === 0}
		<Card class="py-12 text-center">
			<div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
				<Store class="h-8 w-8 text-muted-foreground" />
			</div>
			<h2 class="text-lg font-semibold text-foreground">Belum ada lapak</h2>
			<p class="mt-2 text-muted-foreground">Buat lapak pertama Anda untuk mulai menerima penyetor</p>
			<Button href="/admin/stores/new" class="mt-4 gap-2">
				<Plus class="h-4 w-4" />
				Buat Lapak Pertama
			</Button>
		</Card>
	{:else}
		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each data.stores as store}
				<Card class="group relative overflow-hidden">
					<!-- Status Badge -->
					<div class="absolute right-4 top-4 flex items-center gap-2">
						<span class="rounded-full px-2 py-1 text-xs font-medium {getStatusColor(store.isOpen)}">
							{store.isOpen ? 'Buka' : 'Tutup'}
						</span>
					</div>

					<!-- Store Info -->
					<div class="flex items-start gap-4">
						<div class="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10">
							<Store class="h-7 w-7 text-primary" />
						</div>
						<div class="min-w-0 flex-1">
							<h3 class="truncate text-lg font-semibold text-foreground">{store.name}</h3>
							<div class="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
								{#if store.visibility === 'public'}
									<Eye class="h-3.5 w-3.5" />
									<span>Publik</span>
								{:else}
									<EyeOff class="h-3.5 w-3.5" />
									<span>Privat</span>
								{/if}
							</div>
						</div>
					</div>

					<!-- Stats -->
					<div class="mt-4 grid grid-cols-2 gap-4">
						<div class="rounded-lg bg-muted p-3">
							<div class="flex items-center gap-2 text-sm text-muted-foreground">
								<Users class="h-4 w-4" />
								<span>Anggota</span>
							</div>
							<p class="mt-1 text-xl font-bold text-foreground">{store.memberCount}</p>
						</div>
						<div class="rounded-lg bg-muted p-3">
							<div class="flex items-center gap-2 text-sm text-muted-foreground">
								<Clock class="h-4 w-4" />
								<span>Pending</span>
							</div>
							<p class="mt-1 text-xl font-bold text-foreground">{store.pendingCount}</p>
						</div>
					</div>

					<!-- Actions -->
					<div class="mt-4 flex gap-2">
						<Button href="/admin/stores/{store.id}" variant="outline" size="sm" class="flex-1 gap-1">
							<Settings class="h-4 w-4" />
							Kelola
						</Button>
						<Button href="/admin/stores/{store.id}/members" variant="outline" size="sm" class="flex-1 gap-1">
							<Users class="h-4 w-4" />
							Anggota
						</Button>
						<Button href="/admin/stores/{store.id}/invite" variant="outline" size="sm" class="gap-1">
							<Link class="h-4 w-4" />
						</Button>
					</div>
				</Card>
			{/each}
		</div>
	{/if}
</div>
