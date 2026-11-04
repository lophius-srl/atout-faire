<script lang="ts">
  import { MAIN_DEMO, POIDS_DEMO } from "$lib/cartes-demo";
  import Balance from "$lib/components/Balance.svelte";
  import CarteTache from "$lib/components/Carte.svelte";
  import { separerMain } from "$lib/main";

  const main = separerMain(MAIN_DEMO);

  const sections = [
    {
      titre: "À faire",
      cartes: main.aFaire,
      vide: "Plus rien à faire. Bravo !",
    },
    {
      titre: "Retournées",
      cartes: main.retournees,
      vide: "Aucune carte retournée pour l'instant.",
    },
  ];
</script>

<svelte:head>
  <title>Ma main · Atout faire</title>
</svelte:head>

<h1>Ma main</h1>
<p class="aide">Les cartes que tu as prises cette semaine.</p>

<Balance poidsMoi={POIDS_DEMO.moi} poidsAutre={POIDS_DEMO.autre} />

{#each sections as section (section.titre)}
  <section>
    <h2>{section.titre}</h2>
    {#if section.cartes.length === 0}
      <p class="vide">{section.vide}</p>
    {:else}
      <ul class="grille">
        {#each section.cartes as carte (carte.id)}
          <li><CarteTache {carte} /></li>
        {/each}
      </ul>
    {/if}
  </section>
{/each}

<style>
  h1 {
    margin: 0;
    font-size: 1.8rem;
  }

  .aide {
    margin: 4px 0 16px;
    color: var(--texte-doux);
  }

  h2 {
    margin: 24px 0 12px;
    font-size: 1.15rem;
  }

  .vide {
    color: var(--texte-doux);
  }

  .grille {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 14px;
    margin: 0;
    padding: 0;
    list-style: none;
  }
</style>
