<script lang="ts">
	import { Card } from '$lib/components/ui';
	import { BarChart3, Construction } from 'lucide-svelte';
</script>

<svelte:head>
	<title>Laporan - Admin - Mak Unyil</title>
</svelte:head>

<div class="space-y-6">
	<div>
		<h1 class="text-2xl font-bold text-foreground">Laporan</h1>
		<p class="text-muted-foreground">Analisis dan statistik lapak Anda</p>
	</div>

	<Card class="py-12 text-center">
		<div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
			<Construction class="h-8 w-8 text-muted-foreground" />
		</div>
		<h2 class="text-lg font-semibold text-foreground">Segera Hadir</h2>
		<p class="mt-2 text-muted-foreground">
			Fitur laporan sedang dalam pengembangan
		</p>
	</Card>
</div>
