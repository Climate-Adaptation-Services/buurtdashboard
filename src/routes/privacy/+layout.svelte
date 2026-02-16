<script>
  import { onMount } from 'svelte';

  onMount(() => {
    // Remove the loading screen immediately for this page
    const loader = document.getElementById('app-loading');
    if (loader) loader.remove();
  });
</script>

<slot />
