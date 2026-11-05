<script lang="ts">
  import BandeauMercis from "$lib/components/BandeauMercis.svelte";
  import BatimentDeLaSemaine from "$lib/components/BatimentDeLaSemaine.svelte";
  import Celebration from "$lib/components/Celebration.svelte";
  import { enhance } from "$app/forms";
  import { duree } from "$lib/animations";
  import { avecRetour } from "$lib/formulaire";
  import { DEPENDANCE_CARTES } from "$lib/temps-reel";
  import { resolve } from "$app/paths";
  import CarteTache from "$lib/components/Carte.svelte";
  import { organiserMarche } from "$lib/marche";
  import { sansCartesRetirees } from "$lib/optimiste";
  import { actionsEnAttente, oublierConfirmees } from "$lib/optimiste.svelte";
  import { flip } from "svelte/animate";
  import { trajetVersCible } from "$lib/animations";
  import { annoncerArriveeDansLaMain } from "$lib/rebond.svelte";
  import { cubicIn } from "svelte/easing";
  import { fade } from "svelte/transition";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();

  // La carte piochée quitte le Marché tout de suite ; elle revient si l'autre l'a prise avant.
  const auMarche = $derived(
    sansCartesRetirees(data.auMarche, actionsEnAttente, (c) => c.carte.id),
  );
  const marche = $derived(organiserMarche(auMarche));

  const DUREE_ENVOL = 550;
  let finEnvol = 0;

  /**
   * La carte que je pioche s'envole vers l'onglet « Ma main » en rapetissant.
   * Une carte qui quitte le Marché autrement (prise par l'autre) s'efface simplement.
   */
  function sortie(element: Element, { id }: { id: string }) {
    const onglet = document.querySelector('.navigation a[href$="/ma-main"]');
    const piocheeParMoi = actionsEnAttente.get(id)?.type === "retirer";
    const duration = duree(DUREE_ENVOL);
    if (!onglet || !piocheeParMoi || duration === 0) {
      return fade(element, { duration: duree(200) });
    }
    const { dx, dy, echelle } = trajetVersCible(
      element.getBoundingClientRect(),
      onglet.getBoundingClientRect(),
    );
    finEnvol = performance.now() + duration;
    return {
      duration,
      easing: cubicIn,
      css: (_t: number, u: number) =>
        `z-index: 10; transform: translate(${dx * u}px, ${dy * u}px) scale(${1 - (1 - echelle) * u}) rotate(${-14 * u}deg); opacity: ${1 - 0.6 * u * u};`,
    };
  }

  /** L'onglet rebondit quand la carte arrive, si le serveur a bien confirmé la pioche. */
  function quandPiocheConfirmee() {
    setTimeout(
      annoncerArriveeDansLaMain,
      Math.max(0, finEnvol - performance.now()),
    );
  }
  $effect(() =>
    oublierConfirmees(
      data.auMarche.map((c) => c.carte),
      "marche",
    ),
  );

  const sections = $derived([
    { titre: "Aujourd'hui", cartes: marche.duJour },
    { titre: "Cette semaine", cartes: marche.deLaSemaine },
  ]);
</script>

<svelte:head>
  <title>Marché · Atout faire</title>
</svelte:head>

<Celebration progression={data.progression} recompense={data.recompenseEnJeu} />

<h1>Le Marché</h1>

{#if data.mercisRecus}
  <BandeauMercis message={data.mercisRecus} />
{/if}

{#if data.progression.total > 0}
  <BatimentDeLaSemaine
    niveau={data.niveau}
    retournees={data.progression.retournees}
    total={data.progression.total}
  />
  {#if data.recompenseEnJeu}
    <p class="en-jeu">🎁 À la clé : <strong>{data.recompenseEnJeu}</strong></p>
  {/if}
{/if}
{#if auMarche.length === 0}
  <p class="aide">
    Le Marché est vide. Les cartes arrivent à partir des tâches du
    <a href={resolve("/deck")}>deck</a>.
  </p>
{:else}
  <p class="aide">
    Les cartes qui attendent preneur. Touche une carte pour la prendre.
  </p>

  {#if data.coupDeMain}
    <p class="coup-de-main" role="status">
      🤝 L'autre en porte beaucoup en ce moment. Une carte pour lui donner un
      coup de main ?
    </p>
  {/if}

  {#each sections as section (section.titre)}
    <section>
      <h2>{section.titre}</h2>
      {#if section.cartes.length === 0}
        <p class="vide">Rien à prendre ici.</p>
      {:else}
        <ul class="grille">
          {#each section.cartes as { carte, niveau } (carte.id)}
            <li
              animate:flip={{ duration: duree(250) }}
              out:sortie={{ id: carte.id }}
              class="emplacement"
              class:niveau-1={niveau === 1}
              class:niveau-2={niveau === 2}
            >
              {#if niveau > 0}
                <span class="badge"
                  >{niveau === 2 ? "Attend preneur" : "En attente"}</span
                >
              {/if}
              <form
                method="POST"
                action="?/piocher"
                use:enhance={avecRetour("C'est dans ta main ✋", {
                  recharger: DEPENDANCE_CARTES,
                  surSucces: quandPiocheConfirmee,
                  optimiste: {
                    carte: carte.id,
                    action: { type: "retirer", depuis: "marche" },
                  },
                })}
              >
                <input type="hidden" name="carte" value={carte.id} />
                <button
                  type="submit"
                  class="zone-carte"
                  aria-label={`Piocher ${carte.tache}`}
                >
                  <CarteTache {carte} />
                </button>
              </form>
            </li>
          {/each}
        </ul>
      {/if}
    </section>
  {/each}
{/if}

<style>
  h1 {
    margin: 0;
    font-size: 1.8rem;
  }

  .en-jeu {
    margin: -6px 0 14px;
    padding: 10px 14px;
    border-radius: 14px;
    background: var(--or-fond);
    color: var(--or-texte);
    font-weight: 700;
  }

  .coup-de-main {
    margin: 0 0 8px;
    padding: 12px 14px;
    border-radius: 14px;
    background: var(--violet-fond);
    color: var(--violet-texte);
    font-weight: 700;
  }

  .aide {
    margin: 4px 0 8px;
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

  .emplacement {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 4px;
    border-radius: calc(var(--rayon) + 4px);
  }

  .niveau-1 {
    background: var(--surface);
    box-shadow: 0 0 0 3px #f6b26b;
  }

  .niveau-2 {
    --attente: #e8743b;
    background: var(--surface);
    box-shadow: 0 0 0 4px var(--attente);
    animation: respire 2.4s ease-in-out infinite;
  }

  .badge {
    position: absolute;
    top: -10px;
    right: 8px;
    z-index: 1;
    padding: 2px 10px;
    border-radius: 999px;
    background: var(--attente, #f6b26b);
    color: #4a2a0c;
    font-size: 0.72rem;
    font-weight: 800;
  }

  .zone-carte {
    display: block;
    width: 100%;
    padding: 0;
    border: none;
    background: none;
    font: inherit;
    text-align: left;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }

  @keyframes respire {
    50% {
      box-shadow: 0 0 0 7px rgb(232 116 59 / 55%);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .niveau-2 {
      animation: none;
    }
  }
</style>
