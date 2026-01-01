<script lang="ts">
	import { onMount } from 'svelte';
	import { Clock } from 'lucide-svelte';

	let currentTime = $state('');

	function updateTime() {
		const now = new Date();
		// Convert to WIB (GMT+7)
		const wib = new Date(now.getTime() + (7 * 60 * 60 * 1000));

		const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
		const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

		const dayName = days[wib.getUTCDay()];
		const date = wib.getUTCDate();
		const month = months[wib.getUTCMonth()];
		const year = wib.getUTCFullYear();
		const hours = wib.getUTCHours().toString().padStart(2, '0');
		const minutes = wib.getUTCMinutes().toString().padStart(2, '0');

		currentTime = `${dayName}, ${date} ${month} ${year} • ${hours}:${minutes} WIB`;
	}

	onMount(() => {
		updateTime();
		const interval = setInterval(updateTime, 1000);
		return () => clearInterval(interval);
	});
</script>

<div class="flex items-center gap-2 rounded-lg bg-muted px-3 py-1.5 text-xs text-muted-foreground">
	<Clock class="h-3 w-3" />
	<span class="font-mono">{currentTime}</span>
</div>
