<script lang="ts">
	import { Sun, Moon } from 'lucide-svelte';

	let isDark = $state(false);

	function toggleTheme() {
		isDark = !isDark;
		if (isDark) {
			document.documentElement.classList.add('dark');
			localStorage.setItem('theme', 'dark');
		} else {
			document.documentElement.classList.remove('dark');
			localStorage.setItem('theme', 'light');
		}
	}

	$effect(() => {
		// Check for saved theme or system preference
		const savedTheme = localStorage.getItem('theme');
		const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

		if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
			isDark = true;
			document.documentElement.classList.add('dark');
		}
	});
</script>

<button
	onclick={toggleTheme}
	class="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-foreground transition-colors hover:bg-muted"
	aria-label="Toggle theme"
>
	{#if isDark}
		<Sun class="h-5 w-5" />
	{:else}
		<Moon class="h-5 w-5" />
	{/if}
</button>
