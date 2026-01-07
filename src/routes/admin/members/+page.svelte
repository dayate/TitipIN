<script lang="ts">
	import { Card, Button } from '$lib/components/ui';
	import { Store, Users, ArrowRight } from 'lucide-svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>Pilih Lapak - Anggota - Mak Unyil</title>
</svelte:head>

<div class="space-y-6">
	<div>
		<h1 class="text-2xl font-bold text-foreground">Kelola Anggota</h1>
		<p class="text-muted-foreground">Pilih lapak untuk mengelola anggota</p>
	</div>

	{#if data.stores.length === 0}
		<Card class="py-12 text-center">
			<div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
				<Store class="h-8 w-8 text-muted-foreground" />
			</div>
			<h2 class="text-lg font-semibold text-foreground">Belum ada lapak</h2>
			<p class="mt-2 text-muted-foreground">Anda belum memiliki lapak</p>
			<Button href="/admin/stores/new" class="mt-4">Buat Lapak</Button>
		</Card>
	{:else}
		<div class="grid gap-4 sm:grid-cols-2">
			{#each data.stores as store}
				<a href="/admin/stores/{store.id}/members" class="block">
					<Card class="transition-all hover:border-primary hover:shadow-md">
						<div class="flex items-center justify-between">
							<div class="flex items-center gap-4">
								<div class="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
									<Users class="h-6 w-6 text-primary" />
								</div>
								<div>
									<h3 class="font-semibold text-foreground">{store.name}</h3>
									<p class="text-sm text-muted-foreground">
										{store.isOpen ? 'Buka' : 'Tutup'}
									</p>
								</div>
							</div>
							<ArrowRight class="h-5 w-5 text-muted-foreground" />
						</div>
					</Card>
				</a>
			{/each}
		</div>
	{/if}
</div>
