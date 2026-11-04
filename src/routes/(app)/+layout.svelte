<script lang="ts">
  import { invalidate } from "$app/navigation";
  import NavigationBas from "$lib/components/NavigationBas.svelte";
  import { DEPENDANCE_CARTES, ecouterCartes } from "$lib/temps-reel";
  import type { Snippet } from "svelte";
  import type { LayoutData } from "./$types";

  let { data, children }: { data: LayoutData; children: Snippet } = $props();

  const rafraichirCartes = () => invalidate(DEPENDANCE_CARTES);

  // Les changements faits sur l'autre téléphone arrivent en direct.
  $effect(() => ecouterCartes(data.foyer.id, rafraichirCartes));

  // En revenant sur l'app (iPhone en veille, autre appli), on recharge au cas où la connexion a été coupée.
  function auRetourSurLApp() {
    if (document.visibilityState === "visible") rafraichirCartes();
  }
</script>

<svelte:document onvisibilitychange={auRetourSurLApp} />

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
