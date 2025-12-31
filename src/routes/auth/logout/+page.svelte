<script lang="ts">
	import { enhance } from '$app/forms';
</script>

<!-- This page just triggers the logout action and redirects -->
<form method="POST" use:enhance class="hidden">
	<button type="submit">Logout</button>
</form>

<script>
	// Auto-submit the form
	document.querySelector('form')?.submit();
</script>
