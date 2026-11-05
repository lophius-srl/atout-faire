<script lang="ts">
  import { batimentDuNiveau, fenetresAllumees } from "$lib/batiments";
  import DessinBatiment from "./DessinBatiment.svelte";

  let {
    niveau,
    retournees,
    total,
  }: { niveau: number; retournees: number; total: number } = $props();

  const batiment = $derived(batimentDuNiveau(niveau));
  const suivant = $derived(batimentDuNiveau(niveau + 1));

  const allumees = $derived(
    fenetresAllumees(retournees, total, batiment.fenetres.length),
  );
  const complet = $derived(total > 0 && allumees === batiment.fenetres.length);
  const nom = $derived(
    batiment.nom.charAt(0).toUpperCase() + batiment.nom.slice(1),
  );
</script>

<figure class="batiment" class:complet>
  <DessinBatiment
    {batiment}
    {allumees}
    description={`${nom}, ${allumees} fenêtres allumées sur ${batiment.fenetres.length}`}
  />
  <figcaption>
    <span class="niveau">Niveau {niveau + 1}</span>
    {#if complet}
      ✨ {nom} brille de mille feux ! La semaine prochaine, niveau {niveau + 2} :
      {suivant.nom}.
    {:else}
      {nom} : {allumees}/{batiment.fenetres.length} fenêtres allumées. Illuminez-{batiment.pronom}
      entièrement pour passer {suivant.destination}.
    {/if}
  </figcaption>
</figure>

<style>
  .batiment {
    margin: 12px 0 16px;
    overflow: hidden;
    border-radius: var(--rayon);
    background: #2b2d55;
    box-shadow: var(--carte-ombre);
  }

  figcaption {
    padding: 10px 14px 12px;
    color: #f4efff;
    font-size: 0.9rem;
    font-weight: 600;
  }

  .niveau {
    display: block;
    margin-bottom: 2px;
    color: #b8b2e6;
    font-size: 0.75rem;
    font-weight: 800;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .complet figcaption {
    color: #ffd66b;
    font-weight: 800;
  }
</style>
