<script lang="ts">
	import { Card, Button } from '$lib/components/ui';
	import { enhance } from '$app/forms';
	import {
		Store,
		Clock,
		CheckCircle2,
		LogOut,
		Eye,
		EyeOff,
		Package,
		MapPin,
		Search
	} from 'lucide-svelte';

	let { data } = $props();

	// State for leave modal
	let leaveModalOpen = $state(false);
	let leavingStoreId = $state<number | null>(null);
	let leavingStoreName = $state('');
	let leavingMemberId = $state<number | null>(null);
	let leaveReason = $state('');

	function getStatusBadge(status: string) {
		switch (status) {
			case 'active':
				return {
					class: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
					label: 'Aktif',
					Icon: CheckCircle2
				};
			case 'pending':
				return {
					class: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20',
					label: 'Menunggu',
					Icon: Clock
				};
			case 'leaving':
				return {
					class: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
					label: 'Minta Keluar',
					Icon: LogOut
				};
			default:
				return {
					class: 'bg-muted text-muted-foreground border-border',
					label: status,
					Icon: Store
				};
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

	function formatTime(time: string | null) {
		if (!time) return '';
		return time;
	}
</script>

<svelte:head>
	<title>Lapak Saya - Mak Unyil</title>
</svelte:head>

<div class="space-y-6">
	<!-- Header with Gradient -->
	<div
		class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-background p-6"
	>
		<div class="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/10 blur-2xl"></div>
		<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
			<div class="flex items-center gap-4">
				<div
					class="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/20 backdrop-blur-sm"
				>
					<Store class="h-7 w-7 text-primary" />
				</div>
				<div>
					<h1 class="text-2xl font-bold text-foreground">Lapak Saya</h1>
					<p class="text-muted-foreground">Daftar lapak yang Anda ikuti</p>
				</div>
			</div>
			<Button href="/app/discover" variant="outline" class="gap-2 rounded-xl">
				<Search class="h-4 w-4" />
				Cari Lapak Baru
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
			<p class="mt-2 text-muted-foreground">
				Cari lapak publik atau gunakan kode undangan untuk bergabung
			</p>
			<Button href="/app/discover" class="mt-4 gap-2 rounded-xl">
				<Search class="h-4 w-4" />
				Temukan Lapak
			</Button>
		</div>
	{:else}
		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each data.memberships as { member, store }}
				{@const status = getStatusBadge(member.status)}
				<div
					class="group rounded-2xl border border-border bg-card overflow-hidden shadow-sm transition-all hover:shadow-md hover:border-primary/30"
				>
					<!-- Header -->
					<div class="p-4 pb-3">
						<div class="flex items-start justify-between">
							<div class="flex items-center gap-3">
								<div
									class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10"
								>
									<Store class="h-5 w-5 text-primary" />
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
										<span>•</span>
										<span
											class={store.isOpen
												? 'text-green-600 dark:text-green-400'
												: 'text-red-600 dark:text-red-400'}
										>
											{store.isOpen ? 'Buka' : 'Tutup'}
										</span>
									</div>
								</div>
							</div>
							<span
								class="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium {status.class}"
							>
								<status.Icon class="h-3 w-3" />
								{status.label}
							</span>
						</div>

						<!-- Store Info -->
						<div class="mt-3 space-y-1.5">
							{#if store.operatingDays || store.openTime}
								<div class="flex items-center gap-2 text-xs text-muted-foreground">
									<Clock class="h-3.5 w-3.5 flex-shrink-0" />
									<span>
										{#if store.operatingDays}{store.operatingDays}{/if}
										{#if store.operatingDays && store.openTime}
											•
										{/if}
										{#if store.openTime}{formatTime(store.openTime)} - {formatTime(
												store.closeTime
											)}{/if}
									</span>
								</div>
							{/if}
							{#if store.address}
								<div class="flex items-center gap-2 text-xs text-muted-foreground">
									<MapPin class="h-3.5 w-3.5 flex-shrink-0" />
									<span class="truncate">{store.address}</span>
								</div>
							{/if}
						</div>

						{#if store.description}
							<p class="mt-2 line-clamp-2 text-sm text-muted-foreground">{store.description}</p>
						{/if}
					</div>

					{#if member.status === 'active'}
						<!-- Action Buttons -->
						<div class="border-t border-border p-3">
							<div class="grid grid-cols-2 gap-2">
								<a
									href="/app/{store.id}"
									class="flex items-center justify-center gap-2 rounded-xl border border-border bg-background py-2.5 text-sm font-medium text-foreground transition-all hover:border-primary hover:bg-primary/5"
								>
									<Package class="h-4 w-4 text-primary" />
									Kelola
								</a>
								<button
									type="button"
									onclick={() => openLeaveModal(store.id, store.name, member.id)}
									class="flex items-center justify-center gap-2 rounded-xl border border-border bg-background py-2.5 text-sm font-medium text-destructive transition-all hover:border-destructive hover:bg-destructive/5"
								>
									<LogOut class="h-4 w-4" />
									Keluar
								</button>
							</div>
						</div>
					{:else if member.status === 'pending'}
						<div class="border-t border-border p-4">
							<div class="rounded-xl bg-yellow-500/10 border border-yellow-500/20 p-3 text-center">
								<p class="text-sm font-medium text-yellow-600 dark:text-yellow-400">
									Menunggu persetujuan
								</p>
								<p class="mt-0.5 text-xs text-muted-foreground">
									Pemilik lapak akan review permintaan Anda
								</p>
							</div>
						</div>
					{:else if member.status === 'leaving'}
						<div class="border-t border-border p-4">
							<div class="rounded-xl bg-orange-500/10 border border-orange-500/20 p-3 text-center">
								<p class="text-sm font-medium text-orange-600 dark:text-orange-400">
									Permintaan Keluar Diajukan
								</p>
								<p class="mt-0.5 text-xs text-muted-foreground">Menunggu persetujuan admin</p>
							</div>
						</div>
					{/if}
				</div>
			{/each}
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
