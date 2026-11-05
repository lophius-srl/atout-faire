<script lang="ts">
  import BandeauMercis from "$lib/components/BandeauMercis.svelte";
  import Celebration from "$lib/components/Celebration.svelte";
  import FaitParLautre from "$lib/components/FaitParLautre.svelte";
  import { duree } from "$lib/animations";
  import Balance from "$lib/components/Balance.svelte";
  import CarteAvecActions from "$lib/components/CarteAvecActions.svelte";
  import Echanges from "$lib/components/Echanges.svelte";
  import { separerMain } from "$lib/main";
  import { flip } from "svelte/animate";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();

  const main = $derived(separerMain(data.maMain));

  // Une seule carte affiche ses actions à la fois ; toucher ailleurs les referme.
  let carteOuverte = $state<string | null>(null);

  function fermerSiAilleurs(event: PointerEvent) {
    if (!(event.target as Element).closest(".emplacement")) carteOuverte = null;
  }

  const sections = $derived([
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
  ]);
</script>

<svelte:document
  onpointerdown={fermerSiAilleurs}
  onkeydown={(e) => e.key === "Escape" && (carteOuverte = null)}
/>

<svelte:head>
  <title>Ma main · Atout faire</title>
</svelte:head>

<Celebration progression={data.progression} recompense={data.recompenseEnJeu} />

<h1>Ma main</h1>

{#if data.mercisRecus}
  <BandeauMercis message={data.mercisRecus} />
{/if}
<p class="aide">
  Les cartes que tu as prises cette semaine. Touche une carte pour agir.
</p>

{#if data.semaineFinie}
  <p class="semaine-finie" role="status">
    🎉 Toutes les cartes de la semaine sont retournées. La semaine est finie !
  </p>
{/if}

<Balance poidsMoi={data.poids.moi} poidsAutre={data.poids.autre} />

{#if data.echanges.length > 0}
  <Echanges echanges={data.echanges} aDonner={data.aDonner} />
{/if}

{#each sections as section (section.titre)}
  <section>
    <h2>{section.titre}</h2>
    {#if section.cartes.length === 0}
      <p class="vide">{section.vide}</p>
    {:else}
      <ul class="grille">
        {#each section.cartes as carte (carte.id)}
          <li class="emplacement" animate:flip={{ duration: duree(250) }}>
            <CarteAvecActions
              {carte}
              peutEchanger={!data.engagees.includes(carte.id)}
              ouverte={carteOuverte === carte.id}
              basculer={() =>
                (carteOuverte = carteOuverte === carte.id ? null : carte.id)}
            />
          </li>
        {/each}
      </ul>
    {/if}
  </section>
{/each}

{#if data.faitParLautre.length > 0}
  <FaitParLautre cartes={data.faitParLautre} />
{/if}

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

  .semaine-finie {
    padding: 14px 16px;
    border-radius: var(--rayon);
    background: #dcf5d9;
    color: #3a7a35;
    font-weight: 800;
    text-align: center;
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
