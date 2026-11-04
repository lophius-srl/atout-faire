<script lang="ts">
  import "../app.css";
  import Notifications from "$lib/components/Notifications.svelte";

  let { children } = $props();
</script>

<svelte:head>
  <title>Atout faire</title>
</svelte:head>

{@render children()}

<Notifications />
