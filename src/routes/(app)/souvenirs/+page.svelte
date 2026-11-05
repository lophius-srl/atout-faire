<script lang="ts">
  import { BATIMENTS } from "$lib/batiments";
  import DessinBatiment from "$lib/components/DessinBatiment.svelte";
  import { libelleSemaine } from "$lib/deck";
  import { jourEtMois } from "$lib/vacances";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();

  const parId = new Map(BATIMENTS.map((b) => [b.id, b]));
  const majuscule = (texte: string) =>
    texte.charAt(0).toUpperCase() + texte.slice(1);
</script>

<svelte:head>
  <title>Nos souvenirs · Atout faire</title>
</svelte:head>

<h1>Nos souvenirs</h1>

{#if data.souvenirs.length === 0}
  <p class="aide">
    Votre premier bâtiment vous attend : la tente. Retournez toutes les cartes
    de la semaine pour l'illuminer ensemble.
  </p>
{:else}
  <p class="aide">
    Les bâtiments que vous avez illuminés ensemble :
    {data.souvenirs.length}
    {data.souvenirs.length > 1 ? "semaines vaincues" : "semaine vaincue"}.
  </p>
  <ul class="galerie">
    {#each data.souvenirs as souvenir (souvenir.lundi)}
      {@const batiment = parId.get(souvenir.batimentId) ?? BATIMENTS[0]}
      <li>
        <figure>
          <DessinBatiment
            {batiment}
            allumees={batiment.fenetres.length}
            description={`${majuscule(batiment.nom)} : toutes les fenêtres allumées`}
          />
          <figcaption>
            <span class="niveau">Niveau {souvenir.niveau}</span>
            <strong>{majuscule(batiment.nom)}</strong>
            <span class="semaine"
              >{majuscule(libelleSemaine(souvenir.lundi))}</span
            >
            {#if souvenir.recompense}
              <span class="recompense">
                🎁 {souvenir.recompense.description}
                {#if souvenir.recompense.le}<span class="date"
                    >Vécue le {jourEtMois(souvenir.recompense.le)}</span
                  >{/if}
              </span>
            {/if}
          </figcaption>
        </figure>
      </li>
    {/each}
  </ul>
{/if}

<style>
  h1 {
    margin: 0;
    font-size: 1.8rem;
  }

  .aide {
    color: var(--texte-doux);
  }

  .galerie {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  figure {
    margin: 0;
    overflow: hidden;
    border-radius: var(--rayon);
    background: #2b2d55;
    box-shadow: var(--carte-ombre);
  }

  figcaption {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 8px 10px 10px;
    color: #f4efff;
    font-size: 0.85rem;
  }

  .niveau {
    color: #b8b2e6;
    font-size: 0.7rem;
    font-weight: 800;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  strong {
    color: #ffd66b;
  }

  .semaine {
    color: #d8d3f5;
  }

  .recompense {
    margin-top: 6px;
    padding: 6px 8px;
    border-radius: 10px;
    background: var(--or-fond);
    color: var(--or-texte);
    font-weight: 700;
  }

  .date {
    display: block;
    font-size: 0.75rem;
    font-weight: 600;
  }
</style>
