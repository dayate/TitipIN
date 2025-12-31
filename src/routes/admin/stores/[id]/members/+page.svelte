<script lang="ts">
	import { Card, Button, Input } from '$lib/components/ui';
	import { enhance } from '$app/forms';
	import { formatDate } from '$lib/utils';
	import {
		ArrowLeft,
		Users,
		UserCheck,
		UserX,
		Clock,
		CheckCircle2,
		XCircle,
		MessageSquare,
		User,
		LogOut
	} from 'lucide-svelte';

	let { data } = $props();

	let rejectingMemberId = $state<number | null>(null);
	let rejectReason = $state('');

	let pendingMembers = $derived(data.members.filter(m => m.member.status === 'pending'));
	let activeMembers = $derived(data.members.filter(m => m.member.status === 'active'));
	let leavingMembers = $derived(data.members.filter(m => m.member.status === 'leaving'));

	function openRejectModal(memberId: number) {
		rejectingMemberId = memberId;
		rejectReason = '';
	}

	function closeRejectModal() {
		rejectingMemberId = null;
		rejectReason = '';
	}
</script>

<svelte:head>
	<title>Anggota - {data.store.name} - Mak Unyil</title>
</svelte:head>

<div class="mx-auto max-w-3xl space-y-6">
	<!-- Header -->
	<div>
		<a href="/admin/stores/{data.store.id}" class="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
			<ArrowLeft class="h-4 w-4" />
			Kembali ke {data.store.name}
		</a>
		<h1 class="mt-4 text-2xl font-bold text-foreground">Kelola Anggota</h1>
		<p class="text-muted-foreground">{data.store.name} • {activeMembers.length} anggota aktif</p>
	</div>

	<!-- Pending Requests -->
	{#if pendingMembers.length > 0}
		<Card>
			<div class="mb-4 flex items-center gap-2">
				<Clock class="h-5 w-5 text-yellow-600" />
				<h2 class="text-lg font-semibold text-foreground">Permintaan Bergabung ({pendingMembers.length})</h2>
			</div>

			<div class="divide-y divide-border">
				{#each pendingMembers as { member, user }}
					<div class="py-4 first:pt-0 last:pb-0">
						<div class="flex items-start gap-4">
							<div class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
								<User class="h-6 w-6 text-primary" />
							</div>

							<div class="flex-1 min-w-0">
								<div class="flex items-start justify-between gap-4">
									<div>
										<h3 class="font-semibold text-foreground">{user.name}</h3>
										<p class="text-sm text-muted-foreground">{user.whatsapp}</p>
										<p class="mt-1 text-xs text-muted-foreground">
											{formatDate(member.createdAt!)}
										</p>
									</div>
								</div>

								{#if member.requestMessage}
									<div class="mt-3 rounded-lg bg-muted p-3">
										<div class="flex items-center gap-2 mb-1">
											<MessageSquare class="h-4 w-4 text-muted-foreground" />
											<span class="text-xs font-medium text-muted-foreground">Pesan Permohonan:</span>
										</div>
										<p class="text-sm text-foreground">{member.requestMessage}</p>
									</div>
								{/if}

								{#if member.inviteCodeUsed}
									<p class="mt-2 text-xs text-muted-foreground">
										via Kode: <code class="rounded bg-muted px-1 py-0.5">{member.inviteCodeUsed}</code>
									</p>
								{/if}

								<div class="mt-4 flex gap-2">
									<form method="POST" action="?/approve" use:enhance>
										<input type="hidden" name="memberId" value={member.id} />
										<Button type="submit" size="sm" class="gap-2">
											<UserCheck class="h-4 w-4" />
											Setujui
										</Button>
									</form>
									<Button
										type="button"
										size="sm"
										variant="outline"
										class="gap-2 text-destructive"
										onclick={() => openRejectModal(member.id)}
									>
										<UserX class="h-4 w-4" />
										Tolak
									</Button>
								</div>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</Card>
	{/if}

	<!-- Leave Requests -->
	{#if leavingMembers.length > 0}
		<Card>
			<div class="mb-4 flex items-center gap-2">
				<LogOut class="h-5 w-5 text-orange-600" />
				<h2 class="text-lg font-semibold text-foreground">Permintaan Keluar ({leavingMembers.length})</h2>
			</div>

			<div class="divide-y divide-border">
				{#each leavingMembers as { member, user }}
					<div class="py-4 first:pt-0 last:pb-0">
						<div class="flex items-start gap-4">
							<div class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30">
								<LogOut class="h-6 w-6 text-orange-600 dark:text-orange-400" />
							</div>

							<div class="flex-1 min-w-0">
								<div class="flex items-start justify-between gap-4">
									<div>
										<h3 class="font-semibold text-foreground">{user.name}</h3>
										<p class="text-sm text-muted-foreground">{user.whatsapp}</p>
										<p class="mt-1 text-xs text-muted-foreground">
											Diajukan: {formatDate(member.leaveRequestedAt!)}
										</p>
									</div>
								</div>

								{#if member.leaveReason}
									<div class="mt-3 rounded-lg bg-orange-100 dark:bg-orange-900/20 p-3">
										<div class="flex items-center gap-2 mb-1">
											<MessageSquare class="h-4 w-4 text-orange-600 dark:text-orange-400" />
											<span class="text-xs font-medium text-orange-600 dark:text-orange-400">Alasan Keluar:</span>
										</div>
										<p class="text-sm text-foreground">{member.leaveReason}</p>
									</div>
								{/if}

								<div class="mt-4 flex gap-2">
									<form method="POST" action="?/approveLeave" use:enhance>
										<input type="hidden" name="memberId" value={member.id} />
										<Button type="submit" size="sm" variant="outline" class="gap-2">
											<CheckCircle2 class="h-4 w-4" />
											Setujui Keluar
										</Button>
									</form>
									<form method="POST" action="?/cancelLeave" use:enhance>
										<input type="hidden" name="memberId" value={member.id} />
										<Button type="submit" size="sm" variant="ghost" class="gap-2">
											<XCircle class="h-4 w-4" />
											Tolak
										</Button>
									</form>
								</div>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</Card>
	{/if}

	<!-- Active Members -->
	<Card>
		<div class="mb-4 flex items-center gap-2">
			<Users class="h-5 w-5 text-green-600" />
			<h2 class="text-lg font-semibold text-foreground">Anggota Aktif ({activeMembers.length})</h2>
		</div>

		{#if activeMembers.length === 0}
			<p class="text-center text-muted-foreground py-8">Belum ada anggota aktif</p>
		{:else}
			<div class="divide-y divide-border">
				{#each activeMembers as { member, user }}
					<div class="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
						<div class="flex items-center gap-3">
							<div class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
								<CheckCircle2 class="h-5 w-5 text-green-600 dark:text-green-400" />
							</div>
							<div>
								<h3 class="font-medium text-foreground">{user.name}</h3>
								<p class="text-sm text-muted-foreground">{user.whatsapp}</p>
							</div>
						</div>

						<form method="POST" action="?/kick" use:enhance>
							<input type="hidden" name="memberId" value={member.id} />
							<Button type="submit" size="sm" variant="ghost" class="text-destructive hover:bg-destructive/10">
								<XCircle class="h-4 w-4" />
							</Button>
						</form>
					</div>
				{/each}
			</div>
		{/if}
	</Card>
</div>

<!-- Reject Modal -->
{#if rejectingMemberId !== null}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
		<Card class="w-full max-w-md">
			<h3 class="text-lg font-semibold text-foreground">Tolak Permintaan</h3>
			<p class="mt-2 text-muted-foreground">
				Berikan alasan penolakan agar user memahami mengapa permintaannya ditolak.
			</p>

			<form
				method="POST"
				action="?/reject"
				use:enhance={() => {
					return async ({ update }) => {
						closeRejectModal();
						await update();
					};
				}}
				class="mt-4 space-y-4"
			>
				<input type="hidden" name="memberId" value={rejectingMemberId} />

				<div class="space-y-2">
					<label for="reason" class="text-sm font-medium text-foreground">Alasan Penolakan (Opsional)</label>
					<textarea
						id="reason"
						name="reason"
						rows="3"
						class="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
						placeholder="Contoh: Lapak sudah penuh, silakan coba lagi nanti..."
						bind:value={rejectReason}
					></textarea>
				</div>

				<div class="flex gap-3">
					<Button type="button" variant="outline" class="flex-1" onclick={closeRejectModal}>
						Batal
					</Button>
					<Button type="submit" variant="destructive" class="flex-1">
						Tolak Permintaan
					</Button>
				</div>
			</form>
		</Card>
	</div>
{/if}
