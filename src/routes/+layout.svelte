<script lang="ts">
  import "../app.css";

  let { children } = $props();
</script>

<svelte:head>
  <title>Atout faire</title>
</svelte:head>

{@render children()}
