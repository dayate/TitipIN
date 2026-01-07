<script lang="ts">
	import { Card, Button, Input } from '$lib/components/ui';
	import { Settings, User, Bell, Shield } from 'lucide-svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>Pengaturan - Admin - Mak Unyil</title>
</svelte:head>

<div class="mx-auto max-w-2xl space-y-6">
	<div>
		<h1 class="text-2xl font-bold text-foreground">Pengaturan</h1>
		<p class="text-muted-foreground">Kelola pengaturan akun Anda</p>
	</div>

	<!-- Profile Section -->
	<Card>
		<div class="flex items-center gap-4 mb-6">
			<div class="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
				<User class="h-6 w-6 text-primary" />
			</div>
			<div>
				<h3 class="font-semibold text-foreground">Profil</h3>
				<p class="text-sm text-muted-foreground">Informasi akun Anda</p>
			</div>
		</div>

		<div class="space-y-4">
			<div class="rounded-lg bg-muted p-4">
				<p class="text-sm text-muted-foreground">Nama</p>
				<p class="font-medium text-foreground">{data.user.name}</p>
			</div>
			<div class="rounded-lg bg-muted p-4">
				<p class="text-sm text-muted-foreground">WhatsApp</p>
				<p class="font-medium text-foreground">{data.user.whatsapp}</p>
			</div>
			<div class="rounded-lg bg-muted p-4">
				<p class="text-sm text-muted-foreground">Role</p>
				<p class="font-medium text-foreground capitalize">{data.user.role}</p>
			</div>
		</div>
	</Card>

	<!-- Security Section -->
	<Card>
		<div class="flex items-center gap-4 mb-6">
			<div class="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
				<Shield class="h-6 w-6 text-primary" />
			</div>
			<div>
				<h3 class="font-semibold text-foreground">Keamanan</h3>
				<p class="text-sm text-muted-foreground">Kelola PIN dan keamanan akun</p>
			</div>
		</div>

		<Button href="/auth/reset-pin" variant="outline" class="w-full">Ubah PIN</Button>
	</Card>
</div>
