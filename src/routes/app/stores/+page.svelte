<script lang="ts">
	import { Card, Button } from '$lib/components/ui';
	import { enhance } from '$app/forms';
	import { Store, Plus, Clock, CheckCircle2, LogOut, Eye, EyeOff, Users } from 'lucide-svelte';

	let { data } = $props();

	let leaveModalOpen = $state(false);
	let leavingStoreId = $state<number | null>(null);
	let leavingStoreName = $state('');
	let leavingMemberId = $state<number | null>(null);
	let leaveReason = $state('');

	function getStatusBadge(status: string) {
		switch (status) {
			case 'active':
				return { class: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', label: 'Aktif', Icon: CheckCircle2 };
			case 'pending':
				return { class: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', label: 'Menunggu', Icon: Clock };
			case 'leaving':
				return { class: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400', label: 'Minta Keluar', Icon: LogOut };
			default:
				return { class: 'bg-muted text-muted-foreground', label: status, Icon: Store };
		}
	}

	function openLeaveModal(storeId: number, storeName: string, memberId: number) {
		leavingStoreId = storeId;
		leavingStoreName = storeName;
		leavingMemberId = memberId;
		leaveReason = '';
		leaveModalOpen = true;
	}

	function closeLeaveModal() {
		leaveModalOpen = false;
		leavingStoreId = null;
		leavingStoreName = '';
		leavingMemberId = null;
		leaveReason = '';
	}
</script>

<svelte:head>
	<title>Lapak Saya - Mak Unyil</title>
</svelte:head>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<div>
			<h1 class="text-2xl font-bold text-foreground">Lapak Saya</h1>
			<p class="text-muted-foreground">Daftar lapak yang Anda ikuti</p>
		</div>
		<Button href="/app/join" class="gap-2">
			<Plus class="h-4 w-4" />
			Gabung Lapak
		</Button>
	</div>

	<!-- Joined Stores List -->
	{#if data.memberships.length === 0}
		<Card class="py-12 text-center">
			<div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
				<Store class="h-8 w-8 text-muted-foreground" />
			</div>
			<h2 class="text-lg font-semibold text-foreground">Belum bergabung di lapak manapun</h2>
			<p class="mt-2 text-muted-foreground">Minta kode undangan dari pemilik lapak untuk bergabung</p>
			<Button href="/app/join" class="mt-4 gap-2">
				<Plus class="h-4 w-4" />
				Gabung Lapak
			</Button>
		</Card>
	{:else}
		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each data.memberships as { member, store }}
				{@const status = getStatusBadge(member.status)}
				<Card class="relative">
					<!-- Status Badge -->
					<div class="absolute right-4 top-4">
						<span class="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium {status.class}">
							<status.Icon class="h-3 w-3" />
							{status.label}
						</span>
					</div>

					<!-- Store Info -->
					<div class="flex items-start gap-4">
						<div class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10">
							<Store class="h-6 w-6 text-primary" />
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
								<span>•</span>
								<span class={store.isOpen ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
									{store.isOpen ? 'Buka' : 'Tutup'}
								</span>
							</div>
						</div>
					</div>

					{#if store.description}
						<p class="mt-3 line-clamp-2 text-sm text-muted-foreground">{store.description}</p>
					{/if}

					{#if member.status === 'active'}
						<div class="mt-4 flex gap-2">
							<Button href="/app/setor?store={store.id}" class="flex-1">
								Setor Produk
							</Button>
							<Button
								type="button"
								variant="outline"
								class="text-destructive"
								onclick={() => openLeaveModal(store.id, store.name, member.id)}
							>
								<LogOut class="h-4 w-4" />
							</Button>
						</div>
					{:else if member.status === 'pending'}
						<p class="mt-4 text-center text-sm text-muted-foreground">
							Menunggu persetujuan pemilik lapak
						</p>
					{:else if member.status === 'leaving'}
						<div class="mt-4 rounded-lg bg-orange-100 dark:bg-orange-900/20 p-3">
							<p class="text-sm font-medium text-orange-700 dark:text-orange-400">Permintaan Keluar Diajukan</p>
							<p class="mt-1 text-xs text-muted-foreground">Menunggu persetujuan admin</p>
						</div>
					{/if}
				</Card>
			{/each}
		</div>
	{/if}

	<!-- Discover Public Stores -->
	{#if data.discoverStores.length > 0}
		<div class="mt-8">
			<h2 class="mb-4 text-xl font-bold text-foreground">Temukan Lapak</h2>
			<p class="mb-4 text-muted-foreground">Lapak publik yang bisa Anda ikuti</p>

			<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{#each data.discoverStores as store}
					<Card class="relative">
						<!-- Visibility Badge -->
						<div class="absolute right-4 top-4">
							<span class="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
								<Eye class="h-3 w-3" />
								Publik
							</span>
						</div>

						<!-- Store Info -->
						<div class="flex items-start gap-4">
							<div class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10">
								<Store class="h-6 w-6 text-primary" />
							</div>
							<div class="min-w-0 flex-1">
								<h3 class="truncate text-lg font-semibold text-foreground">{store.name}</h3>
								<div class="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
									<span class={store.isOpen ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
										{store.isOpen ? 'Buka' : 'Tutup'}
									</span>
								</div>
							</div>
						</div>

						{#if store.description}
							<p class="mt-3 line-clamp-2 text-sm text-muted-foreground">{store.description}</p>
						{/if}

						<Button href="/app/stores/{store.id}/join" variant="outline" class="mt-4 w-full gap-2">
							<Users class="h-4 w-4" />
							Minta Bergabung
						</Button>
					</Card>
				{/each}
			</div>
		</div>
	{/if}
</div>

<!-- Leave Store Modal -->
{#if leaveModalOpen}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
		<Card class="w-full max-w-md">
			<h3 class="text-lg font-semibold text-foreground">Keluar dari {leavingStoreName}?</h3>
			<p class="mt-2 text-muted-foreground">
				Permintaan keluar akan dikirim ke admin untuk disetujui. Berikan alasan Anda ingin keluar.
			</p>

			<form
				method="POST"
				action="?/requestLeave"
				use:enhance={() => {
					return async ({ update }) => {
						closeLeaveModal();
						await update();
					};
				}}
				class="mt-4 space-y-4"
			>
				<input type="hidden" name="memberId" value={leavingMemberId} />

				<div class="space-y-2">
					<label for="leaveReason" class="text-sm font-medium text-foreground">Alasan Keluar</label>
					<textarea
						id="leaveReason"
						name="reason"
						rows="3"
						class="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
						placeholder="Jelaskan alasan Anda ingin keluar dari lapak ini..."
						bind:value={leaveReason}
						required
					></textarea>
				</div>

				<div class="flex gap-3">
					<Button type="button" variant="outline" class="flex-1" onclick={closeLeaveModal}>
						Batal
					</Button>
					<Button type="submit" variant="destructive" class="flex-1">
						Ajukan Keluar
					</Button>
				</div>
			</form>
		</Card>
	</div>
{/if}
