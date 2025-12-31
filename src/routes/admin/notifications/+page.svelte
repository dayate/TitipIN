<script lang="ts">
	import { Card, Button } from '$lib/components/ui';
	import { enhance } from '$app/forms';
	import {
		Bell,
		CheckCheck,
		UserPlus,
		UserCheck,
		UserX,
		AlertCircle,
		Info,
		ExternalLink,
		Trash2
	} from 'lucide-svelte';

	let { data } = $props();

	function getNotificationIcon(type: string) {
		switch (type) {
			case 'join_request':
				return UserPlus;
			case 'join_approved':
				return UserCheck;
			case 'join_rejected':
			case 'member_kicked':
				return UserX;
			case 'system':
				return AlertCircle;
			default:
				return Info;
		}
	}

	function getNotificationColor(type: string) {
		switch (type) {
			case 'join_request':
				return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
			case 'join_approved':
				return 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400';
			case 'join_rejected':
			case 'member_kicked':
				return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400';
			case 'system':
				return 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400';
			default:
				return 'bg-muted text-muted-foreground';
		}
	}

	function formatRelativeTime(date: Date) {
		const now = new Date();
		const diff = now.getTime() - new Date(date).getTime();
		const minutes = Math.floor(diff / 60000);
		const hours = Math.floor(diff / 3600000);
		const days = Math.floor(diff / 86400000);

		if (minutes < 1) return 'Baru saja';
		if (minutes < 60) return `${minutes} menit lalu`;
		if (hours < 24) return `${hours} jam lalu`;
		if (days < 7) return `${days} hari lalu`;
		return new Date(date).toLocaleDateString('id-ID', {
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		});
	}

	let unreadCount = $derived(data.notifications.filter(n => !n.isRead).length);
</script>

<svelte:head>
	<title>Notifikasi - Admin - Mak Unyil</title>
</svelte:head>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold text-foreground">Notifikasi</h1>
			<p class="text-muted-foreground">
				{#if unreadCount > 0}
					{unreadCount} notifikasi belum dibaca
				{:else}
					Semua notifikasi sudah dibaca
				{/if}
			</p>
		</div>
		{#if unreadCount > 0}
			<form method="POST" action="?/markAllAsRead" use:enhance>
				<Button type="submit" variant="outline" class="gap-2">
					<CheckCheck class="h-4 w-4" />
					Tandai Semua Dibaca
				</Button>
			</form>
		{/if}
	</div>

	<!-- Notifications List -->
	{#if data.notifications.length === 0}
		<Card class="py-12 text-center">
			<div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
				<Bell class="h-8 w-8 text-muted-foreground" />
			</div>
			<h2 class="text-lg font-semibold text-foreground">Tidak ada notifikasi</h2>
			<p class="mt-2 text-muted-foreground">Notifikasi akan muncul di sini</p>
		</Card>
	{:else}
		<div class="space-y-3">
			{#each data.notifications as notification}
				{@const IconComponent = getNotificationIcon(notification.type)}
				{@const colorClass = getNotificationColor(notification.type)}
				<Card class="relative {!notification.isRead ? 'border-l-4 border-l-primary bg-primary/5' : ''}">
					<div class="flex gap-4">
						<!-- Icon -->
						<div class="flex-shrink-0">
							<div class="flex h-10 w-10 items-center justify-center rounded-full {colorClass}">
								<IconComponent class="h-5 w-5" />
							</div>
						</div>

						<!-- Content -->
						<div class="flex-1 min-w-0">
							<div class="flex items-start justify-between gap-2">
								<div>
									<h3 class="font-semibold text-foreground {!notification.isRead ? '' : 'font-normal'}">
										{notification.title}
									</h3>
									<p class="mt-1 text-sm text-muted-foreground">{notification.message}</p>
								</div>
								<span class="flex-shrink-0 text-xs text-muted-foreground">
									{formatRelativeTime(notification.createdAt!)}
								</span>
							</div>

							<!-- Actions -->
							<div class="mt-3 flex items-center gap-2">
								{#if notification.detailUrl}
									<Button href={notification.detailUrl} size="sm" variant="outline" class="gap-2">
										<ExternalLink class="h-3.5 w-3.5" />
										Lihat Detail
									</Button>
								{/if}
								{#if !notification.isRead}
									<form method="POST" action="?/markAsRead" use:enhance class="inline">
										<input type="hidden" name="notificationId" value={notification.id} />
										<Button type="submit" size="sm" variant="ghost">
											Tandai Dibaca
										</Button>
									</form>
								{/if}
								<form method="POST" action="?/delete" use:enhance class="inline">
									<input type="hidden" name="notificationId" value={notification.id} />
									<Button type="submit" size="sm" variant="ghost" class="text-destructive hover:bg-destructive/10">
										<Trash2 class="h-3.5 w-3.5" />
									</Button>
								</form>
							</div>
						</div>
					</div>
				</Card>
			{/each}
		</div>
	{/if}
</div>
