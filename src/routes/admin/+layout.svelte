<script lang="ts">
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import ServerClock from '$lib/components/ServerClock.svelte';
	import { Button } from '$lib/components/ui';
	import { getInitials } from '$lib/utils';
	import { page } from '$app/stores';
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { onMount, onDestroy } from 'svelte';
	import {
		notificationStore,
		unreadCount as sseUnreadCount,
		notifications as sseNotifications
	} from '$lib/stores/notificationStore';
	import {
		Store,
		LayoutDashboard,
		Package,
		Users,
		FileText,
		Bell,
		BarChart3,
		Settings,
		LogOut,
		Menu,
		X,
		ChevronDown,
		PanelLeftClose,
		PanelLeft
	} from 'lucide-svelte';

	let { data, children } = $props();
	let sidebarOpen = $state(false);
	let sidebarCollapsed = $state(false);
	let userMenuOpen = $state(false);
	let notificationMenuOpen = $state(false);

	const navItems = [
		{ href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
		{ href: '/admin/stores', icon: Store, label: 'Lapak' },
		{ href: '/admin/transactions', icon: FileText, label: 'Transaksi' },
		{ href: '/admin/notifications', icon: Bell, label: 'Notifikasi' },
		{ href: '/admin/settings', icon: Settings, label: 'Pengaturan' }
	];

	let currentPath = $derived($page.url.pathname);

	// Real-time notification values dari SSE store
	let realtimeUnreadCount = $derived($sseUnreadCount);
	let realtimeNotifications = $derived($sseNotifications);

	// Gunakan real-time value jika lebih besar, fallback ke server data
	let displayUnreadCount = $derived(
		realtimeUnreadCount > 0 ? realtimeUnreadCount : data.unreadNotifications
	);
	let displayNotifications = $derived(
		realtimeNotifications.length > 0 ? realtimeNotifications : data.notifications
	);

	// Inisialisasi SSE connection
	onMount(() => {
		// Initialize dengan data dari server (hydration)
		notificationStore.initialize({
			unreadCount: data.unreadNotifications,
			notifications: data.notifications || []
		});
		// Connect ke SSE untuk real-time updates
		notificationStore.connect();
	});

	onDestroy(() => {
		notificationStore.disconnect();
	});

	function closeMobileSidebar() {
		sidebarOpen = false;
	}
</script>

<div class="flex min-h-screen bg-background">
	<!-- Sidebar Overlay (Mobile) -->
	{#if sidebarOpen}
		<div
			class="fixed inset-0 z-40 bg-black/50 lg:hidden"
			onclick={closeMobileSidebar}
			onkeydown={(e) => e.key === 'Escape' && closeMobileSidebar()}
			role="button"
			tabindex="0"
			aria-label="Close sidebar"
		></div>
	{/if}

	<!-- Sidebar -->
	<aside
		class="fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border bg-card transition-all duration-300
			lg:static
			{sidebarCollapsed ? 'lg:w-16' : 'lg:w-64'}
			{sidebarOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full lg:translate-x-0'}"
	>
		<!-- Logo -->
		<div class="flex h-16 items-center gap-3 border-b border-border px-4">
			<div class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary">
				<Store class="h-6 w-6 text-primary-foreground" />
			</div>
			{#if !sidebarCollapsed}
				<div class="min-w-0 flex-1 lg:block">
					<span class="font-bold text-foreground">Mak Unyil</span>
					<span class="block truncate text-xs text-muted-foreground">Admin Panel</span>
				</div>
			{/if}
			<!-- Close button (Mobile) -->
			<button
				onclick={closeMobileSidebar}
				class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg hover:bg-muted lg:hidden"
				aria-label="Close sidebar"
			>
				<X class="h-5 w-5 text-foreground" />
			</button>
		</div>

		<nav class="flex-1 space-y-1 overflow-y-auto p-2">
			{#each navItems as item}
				<a
					href={item.href}
					onclick={closeMobileSidebar}
					class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors
						{currentPath === item.href
						? 'bg-primary text-primary-foreground'
						: 'text-foreground hover:bg-muted'}
						{sidebarCollapsed ? 'lg:justify-center lg:px-2' : ''}"
					title={sidebarCollapsed ? item.label : ''}
				>
					<div class="relative flex-shrink-0">
						<item.icon class="h-5 w-5" />
						{#if item.label === 'Notifikasi' && displayUnreadCount > 0}
							<span
								class="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground"
							>
								{displayUnreadCount > 9 ? '9+' : displayUnreadCount}
							</span>
						{/if}
					</div>
					{#if !sidebarCollapsed}
						<span class="lg:block">{item.label}</span>
					{/if}
				</a>
			{/each}
		</nav>

		<!-- User Section -->
		<div class="border-t border-border p-2">
			<form action="/auth/logout" method="POST">
				<button
					type="submit"
					class="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-muted
						{sidebarCollapsed ? 'lg:justify-center lg:px-2' : ''}"
					title={sidebarCollapsed ? 'Keluar' : ''}
				>
					<LogOut class="h-5 w-5 flex-shrink-0" />
					{#if !sidebarCollapsed}
						<span class="lg:block">Keluar</span>
					{/if}
				</button>
			</form>
		</div>
	</aside>

	<!-- Main Content -->
	<div class="flex min-w-0 flex-1 flex-col">
		<!-- Top Header -->
		<header
			class="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-card px-4"
		>
			<!-- Mobile menu button -->
			<button
				onclick={() => (sidebarOpen = true)}
				class="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-muted lg:hidden"
				aria-label="Open sidebar"
			>
				<Menu class="h-6 w-6 text-foreground" />
			</button>

			<!-- Desktop sidebar toggle -->
			<button
				onclick={() => (sidebarCollapsed = !sidebarCollapsed)}
				class="hidden h-10 w-10 items-center justify-center rounded-lg hover:bg-muted lg:flex"
				aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
			>
				{#if sidebarCollapsed}
					<PanelLeft class="h-5 w-5 text-foreground" />
				{:else}
					<PanelLeftClose class="h-5 w-5 text-foreground" />
				{/if}
			</button>

			<!-- Server Clock -->
			<div class="hidden sm:block">
				<ServerClock />
			</div>

			<div class="flex-1"></div>

			<!-- Notification Bell with Dropdown -->
			<div class="relative">
				<button
					onclick={() => (notificationMenuOpen = !notificationMenuOpen)}
					class="relative flex h-10 w-10 items-center justify-center rounded-lg hover:bg-muted"
					aria-label="Notifications"
				>
					<Bell class="h-5 w-5 text-muted-foreground" />
					{#if displayUnreadCount > 0}
						<span
							class="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground"
						>
							{displayUnreadCount > 9 ? '9+' : displayUnreadCount}
						</span>
					{/if}
				</button>

				{#if notificationMenuOpen}
					<!-- Backdrop -->
					<div
						class="fixed inset-0 z-40"
						onclick={() => (notificationMenuOpen = false)}
						onkeydown={(e) => e.key === 'Escape' && (notificationMenuOpen = false)}
						role="button"
						tabindex="0"
						aria-label="Close notifications"
					></div>
					<!-- Dropdown - Responsive -->
					<div
						class="fixed inset-x-4 top-16 z-50 sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2 sm:w-80 max-h-[70vh] sm:max-h-96 overflow-hidden rounded-xl border border-border bg-card shadow-xl"
					>
						<div class="flex items-center justify-between border-b border-border px-4 py-3">
							<h3 class="font-semibold text-foreground">Notifikasi</h3>
							{#if displayUnreadCount > 0}
								<form
									method="POST"
									action="/admin/notifications?/markAllAsRead"
									class="inline"
									use:enhance={() => {
										notificationMenuOpen = false;
										return async () => {
											await invalidateAll();
										};
									}}
								>
									<button type="submit" class="text-xs text-primary hover:underline">
										Tandai Dibaca
									</button>
								</form>
							{/if}
						</div>
						<div class="max-h-[50vh] sm:max-h-72 overflow-y-auto">
							{#if displayNotifications && displayNotifications.length > 0}
								{#each displayNotifications.slice(0, 5) as notification}
									<form
										method="POST"
										action="/admin/notifications?/markAsRead"
										use:enhance={() => {
											notificationMenuOpen = false;
											return async () => {
												await invalidateAll();
												window.location.href = notification.detailUrl || '/admin/notifications';
											};
										}}
										class="block"
									>
										<input type="hidden" name="notificationId" value={notification.id} />
										<button
											type="submit"
											class="w-full text-left px-4 py-3 border-b border-border last:border-0 transition-all cursor-pointer
												{!notification.isRead ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-muted'}
												active:bg-muted/80"
										>
											<div class="flex items-start gap-2">
												{#if !notification.isRead}
													<div class="h-2 w-2 mt-1.5 flex-shrink-0 rounded-full bg-primary"></div>
												{:else}
													<div class="w-2 flex-shrink-0"></div>
												{/if}
												<div class="min-w-0 flex-1">
													<p
														class="text-sm font-medium text-foreground truncate {!notification.isRead
															? 'font-semibold'
															: ''}"
													>
														{notification.title}
													</p>
													<p class="text-xs text-muted-foreground line-clamp-2">
														{notification.message}
													</p>
													<p class="mt-1 text-[10px] text-muted-foreground/70">
														{#if notification.createdAt}
															{new Date(notification.createdAt).toLocaleDateString('id-ID', {
																day: 'numeric',
																month: 'short'
															})} • {new Date(notification.createdAt).toLocaleTimeString('id-ID', {
																hour: '2-digit',
																minute: '2-digit'
															})}
														{/if}
													</p>
												</div>
											</div>
										</button>
									</form>
								{/each}
							{:else}
								<div class="px-4 py-8 text-center text-sm text-muted-foreground">
									Tidak ada notifikasi
								</div>
							{/if}
						</div>
						<a
							href="/admin/notifications"
							onclick={() => (notificationMenuOpen = false)}
							class="flex items-center justify-center border-t border-border px-4 py-3 text-sm font-medium text-primary hover:bg-muted"
						>
							Lihat Semua Notifikasi
						</a>
					</div>
				{/if}
			</div>

			<ThemeToggle />

			<!-- User Menu -->
			<div class="relative">
				<button
					onclick={() => (userMenuOpen = !userMenuOpen)}
					class="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-muted"
				>
					<div
						class="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground"
					>
						{getInitials(data.user.name)}
					</div>
					<div class="hidden text-left md:block">
						<div class="text-sm font-medium text-foreground">
							{data.user.name}
						</div>
						<div class="text-xs text-muted-foreground">Pemilik Lapak</div>
					</div>
					<ChevronDown class="hidden h-4 w-4 text-muted-foreground md:block" />
				</button>

				{#if userMenuOpen}
					<!-- Backdrop to close menu -->
					<div
						class="fixed inset-0 z-40"
						onclick={() => (userMenuOpen = false)}
						onkeydown={(e) => e.key === 'Escape' && (userMenuOpen = false)}
						role="button"
						tabindex="0"
						aria-label="Close menu"
					></div>
					<div
						class="absolute right-0 top-full z-50 mt-2 w-48 rounded-lg border border-border bg-card py-1 shadow-lg"
					>
						<a
							href="/admin/profile"
							onclick={() => (userMenuOpen = false)}
							class="block px-4 py-2 text-sm text-foreground hover:bg-muted"
						>
							Profil Saya
						</a>
						<a
							href="/admin/settings"
							onclick={() => (userMenuOpen = false)}
							class="block px-4 py-2 text-sm text-foreground hover:bg-muted"
						>
							Pengaturan
						</a>
						<hr class="my-1 border-border" />
						<form action="/auth/logout" method="POST">
							<button
								type="submit"
								class="block w-full px-4 py-2 text-left text-sm text-destructive hover:bg-muted"
							>
								Keluar
							</button>
						</form>
					</div>
				{/if}
			</div>
		</header>

		<!-- Page Content -->
		<main class="flex-1 overflow-auto p-4 md:p-6">
			{@render children()}
		</main>
	</div>
</div>
