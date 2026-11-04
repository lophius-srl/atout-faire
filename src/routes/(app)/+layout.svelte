<script lang="ts">
  import NavigationBas from "$lib/components/NavigationBas.svelte";

  let { children } = $props();
</script>

<div class="ecran">
  {@render children()}
</div>

<NavigationBas />

<style>
  .ecran {
    max-width: 480px;
    margin: 0 auto;
    padding: 24px 0 calc(96px + env(safe-area-inset-bottom));
  }
</style>
