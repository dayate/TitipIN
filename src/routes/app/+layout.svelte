<script lang="ts">
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import { Button } from '$lib/components/ui';
	import { getInitials } from '$lib/utils';
	import { page } from '$app/stores';
	import {
		Store,
		Home,
		Package,
		History,
		Bell,
		User,
		LogOut,
		Menu,
		X,
		ChevronDown
	} from 'lucide-svelte';

	let { data, children } = $props();
	let mobileMenuOpen = $state(false);
	let userMenuOpen = $state(false);

	const navItems = [
		{ href: '/app', icon: Home, label: 'Beranda' },
		{ href: '/app/stores', icon: Store, label: 'Lapak' },
		{ href: '/app/setor', icon: Package, label: 'Setor' },
		{ href: '/app/history', icon: History, label: 'Riwayat' }
	];

	let currentPath = $derived($page.url.pathname);

	function closeMobileMenu() {
		mobileMenuOpen = false;
	}

	function closeUserMenu() {
		userMenuOpen = false;
	}
</script>

<div class="flex min-h-screen flex-col bg-background">
	<!-- Top Navigation -->
	<header class="sticky top-0 z-50 border-b border-border bg-card">
		<div class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
			<!-- Logo -->
			<a href="/app" class="flex items-center gap-2">
				<div class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
					<Store class="h-6 w-6 text-primary-foreground" />
				</div>
				<span class="hidden text-xl font-bold text-foreground sm:block">Mak Unyil</span>
			</a>

			<!-- Desktop Navigation -->
			<nav class="hidden items-center gap-1 md:flex">
				{#each navItems as item}
					<a
						href={item.href}
						class="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors
							{currentPath === item.href
								? 'bg-primary text-primary-foreground'
								: 'text-muted-foreground hover:bg-muted hover:text-foreground'}"
					>
						<item.icon class="h-4 w-4" />
						{item.label}
					</a>
				{/each}
			</nav>

			<!-- Right Section -->
			<div class="flex items-center gap-2">
				<ThemeToggle />

				<!-- User Menu (Desktop) -->
				<div class="relative hidden md:block">
					<button
						onclick={() => (userMenuOpen = !userMenuOpen)}
						class="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-muted"
					>
						<div class="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
							{getInitials(data.user.name)}
						</div>
						<span class="text-sm font-medium text-foreground">{data.user.name}</span>
						<ChevronDown class="h-4 w-4 text-muted-foreground" />
					</button>

					{#if userMenuOpen}
						<!-- Backdrop -->
						<div
							class="fixed inset-0 z-40"
							onclick={closeUserMenu}
							onkeydown={(e) => e.key === 'Escape' && closeUserMenu()}
							role="button"
							tabindex="0"
							aria-label="Close menu"
						></div>
						<div class="absolute right-0 top-full z-50 mt-2 w-48 rounded-lg border border-border bg-card py-1 shadow-lg">
							<a
								href="/app/profile"
								onclick={closeUserMenu}
								class="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted"
							>
								<User class="h-4 w-4" />
								Profil Saya
							</a>
							<hr class="my-1 border-border" />
							<form action="/auth/logout" method="POST">
								<button
									type="submit"
									class="flex w-full items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-muted"
								>
									<LogOut class="h-4 w-4" />
									Keluar
								</button>
							</form>
						</div>
					{/if}
				</div>

				<!-- Mobile Menu Button -->
				<button
					onclick={() => (mobileMenuOpen = !mobileMenuOpen)}
					class="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-muted md:hidden"
					aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
				>
					{#if mobileMenuOpen}
						<X class="h-6 w-6 text-foreground" />
					{:else}
						<Menu class="h-6 w-6 text-foreground" />
					{/if}
				</button>
			</div>
		</div>

		<!-- Mobile Dropdown Menu -->
		{#if mobileMenuOpen}
			<!-- Backdrop -->
			<div
				class="fixed inset-0 top-16 z-40 bg-black/50 md:hidden"
				onclick={closeMobileMenu}
				onkeydown={(e) => e.key === 'Escape' && closeMobileMenu()}
				role="button"
				tabindex="0"
				aria-label="Close menu"
			></div>
			<div class="absolute left-0 right-0 top-16 z-50 border-b border-border bg-card p-4 shadow-lg md:hidden">
				<nav class="space-y-1">
					{#each navItems as item}
						<a
							href={item.href}
							onclick={closeMobileMenu}
							class="flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition-colors
								{currentPath === item.href
									? 'bg-primary text-primary-foreground'
									: 'text-foreground hover:bg-muted'}"
						>
							<item.icon class="h-5 w-5" />
							{item.label}
						</a>
					{/each}
				</nav>

				<hr class="my-4 border-border" />

				<div class="flex items-center gap-3 px-3 py-2">
					<div class="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
						{getInitials(data.user.name)}
					</div>
					<div>
						<p class="font-medium text-foreground">{data.user.name}</p>
						<p class="text-sm text-muted-foreground">Penyetor</p>
					</div>
				</div>

				<form action="/auth/logout" method="POST" class="mt-4">
					<Button type="submit" variant="outline" class="w-full gap-2">
						<LogOut class="h-4 w-4" />
						Keluar
					</Button>
				</form>
			</div>
		{/if}
	</header>

	<!-- Page Content -->
	<main class="mx-auto w-full max-w-7xl flex-1 px-4 py-6 pb-20 md:pb-6">
		{@render children()}
	</main>

	<!-- Bottom Navigation (Mobile) -->
	<nav class="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card safe-area-bottom md:hidden">
		<div class="grid h-16 grid-cols-4">
			{#each navItems as item}
				<a
					href={item.href}
					class="flex flex-col items-center justify-center gap-0.5 transition-colors
						{currentPath === item.href
							? 'text-primary'
							: 'text-muted-foreground hover:text-foreground'}"
				>
					<item.icon class="h-5 w-5" />
					<span class="text-[10px] font-medium">{item.label}</span>
				</a>
			{/each}
		</div>
	</nav>
</div>

<style>
	.safe-area-bottom {
		padding-bottom: env(safe-area-inset-bottom, 0);
	}
</style>
