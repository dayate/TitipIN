<script lang="ts">
	import { enhance } from '$app/forms';
	import { onMount } from 'svelte';

	onMount(() => {
		// Auto-submit the form on mount
		document.querySelector('form')?.requestSubmit();
	});
</script>

<!-- This page just triggers the logout action and redirects -->
<form method="POST" use:enhance class="hidden">
	<button type="submit">Logout</button>
</form>
