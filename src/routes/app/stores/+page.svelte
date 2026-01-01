<script lang="ts">
	import { Card, Button } from '$lib/components/ui';
	import { enhance } from '$app/forms';
	import {
		Store, Plus, Clock, CheckCircle2, LogOut, Eye, EyeOff, Users,
		Package, History, TrendingUp, ArrowRight
	} from 'lucide-svelte';

	let { data } = $props();

	let leaveModalOpen = $state(false);
	let leavingStoreId = $state<number | null>(null);
	let leavingStoreName = $state('');
	let leavingMemberId = $state<number | null>(null);
	let leaveReason = $state('');

	function getStatusBadge(status: string) {
		switch (status) {
			case 'active':
				return { class: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20', label: 'Aktif', Icon: CheckCircle2 };
			case 'pending':
				return { class: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20', label: 'Menunggu', Icon: Clock };
			case 'leaving':
				return { class: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20', label: 'Minta Keluar', Icon: LogOut };
			default:
				return { class: 'bg-muted text-muted-foreground border-border', label: status, Icon: Store };
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
	<!-- Header with Gradient -->
	<div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-background p-6">
		<div class="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/10 blur-2xl"></div>
		<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
			<div class="flex items-center gap-4">
				<div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/20 backdrop-blur-sm">
					<Store class="h-7 w-7 text-primary" />
				</div>
				<div>
					<h1 class="text-2xl font-bold text-foreground">Lapak Saya</h1>
					<p class="text-muted-foreground">Daftar lapak yang Anda ikuti</p>
				</div>
			</div>
			<Button href="/app/join" class="gap-2 rounded-xl shadow-lg shadow-primary/25">
				<Plus class="h-4 w-4" />
				Gabung Lapak
			</Button>
		</div>
	</div>

	<!-- Joined Stores List -->
	{#if data.memberships.length === 0}
		<div class="rounded-2xl border border-dashed border-border bg-muted/30 p-12 text-center">
			<div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
				<Store class="h-8 w-8 text-muted-foreground" />
			</div>
			<h2 class="text-lg font-semibold text-foreground">Belum bergabung di lapak manapun</h2>
			<p class="mt-2 text-muted-foreground">Minta kode undangan dari pemilik lapak untuk bergabung</p>
			<Button href="/app/join" class="mt-4 gap-2 rounded-xl">
				<Plus class="h-4 w-4" />
				Gabung Lapak
			</Button>
		</div>
	{:else}
		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each data.memberships as { member, store }}
				{@const status = getStatusBadge(member.status)}
				<div class="group relative rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:shadow-md hover:border-primary/30">
					<!-- Status Badge -->
					<div class="absolute right-4 top-4">
						<span class="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium {status.class}">
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
						<!-- Quick Actions Grid -->
						<div class="mt-4 grid grid-cols-3 gap-2">
							<a
								href="/app/{store.id}/setor"
								class="flex flex-col items-center gap-1 rounded-xl bg-primary/5 p-3 text-center transition-colors hover:bg-primary/10"
							>
								<Package class="h-5 w-5 text-primary" />
								<span class="text-xs font-medium text-foreground">Setor</span>
							</a>
							<a
								href="/app/{store.id}/products"
								class="flex flex-col items-center gap-1 rounded-xl bg-muted p-3 text-center transition-colors hover:bg-muted/80"
							>
								<TrendingUp class="h-5 w-5 text-muted-foreground" />
								<span class="text-xs font-medium text-foreground">Produk</span>
							</a>
							<a
								href="/app/{store.id}/history"
								class="flex flex-col items-center gap-1 rounded-xl bg-muted p-3 text-center transition-colors hover:bg-muted/80"
							>
								<History class="h-5 w-5 text-muted-foreground" />
								<span class="text-xs font-medium text-foreground">Riwayat</span>
							</a>
						</div>

						<!-- Leave Button -->
						<button
							type="button"
							onclick={() => openLeaveModal(store.id, store.name, member.id)}
							class="mt-3 w-full text-center text-xs text-muted-foreground hover:text-destructive transition-colors"
						>
							Keluar dari lapak
						</button>
					{:else if member.status === 'pending'}
						<div class="mt-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 p-3 text-center">
							<p class="text-sm font-medium text-yellow-600 dark:text-yellow-400">Menunggu persetujuan</p>
							<p class="mt-0.5 text-xs text-muted-foreground">Pemilik lapak akan review permintaan Anda</p>
						</div>
					{:else if member.status === 'leaving'}
						<div class="mt-4 rounded-xl bg-orange-500/10 border border-orange-500/20 p-3 text-center">
							<p class="text-sm font-medium text-orange-600 dark:text-orange-400">Permintaan Keluar Diajukan</p>
							<p class="mt-0.5 text-xs text-muted-foreground">Menunggu persetujuan admin</p>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{/if}

	<!-- Discover Public Stores -->
	{#if data.discoverStores.length > 0}
		<div class="mt-8">
			<div class="flex items-center justify-between mb-4">
				<div>
					<h2 class="text-xl font-bold text-foreground">Temukan Lapak</h2>
					<p class="text-sm text-muted-foreground">Lapak publik yang bisa Anda ikuti</p>
				</div>
			</div>

			<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{#each data.discoverStores as store}
					<div class="group rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:shadow-md hover:border-primary/30">
						<!-- Visibility Badge -->
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
							<h3 class="font-semibold text-foreground truncate">{store.name}</h3>
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
							<ArrowRight class="h-4 w-4" />
						</a>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>

<!-- Leave Store Modal -->
{#if leaveModalOpen}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
		<div class="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
			<h3 class="text-lg font-semibold text-foreground">Keluar dari {leavingStoreName}?</h3>
			<p class="mt-2 text-muted-foreground text-sm">
				Permintaan keluar akan dikirim ke admin untuk disetujui.
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
						class="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none resize-none"
						placeholder="Jelaskan alasan Anda ingin keluar..."
						bind:value={leaveReason}
						required
					></textarea>
				</div>

				<div class="flex gap-3">
					<button
						type="button"
						onclick={closeLeaveModal}
						class="flex-1 rounded-xl border border-border py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
					>
						Batal
					</button>
					<button
						type="submit"
						class="flex-1 rounded-xl bg-destructive py-2.5 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 transition-colors"
					>
						Ajukan Keluar
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
