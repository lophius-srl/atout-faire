<script lang="ts">
  import { resolve } from "$app/paths";
  import { CARTES_DEMO } from "$lib/cartes-demo";
  import CarteTache from "$lib/components/Carte.svelte";

  let cartes = $state(CARTES_DEMO.map((carte) => ({ ...carte })));

  const toutesRetournees = $derived(cartes.every((carte) => carte.retournee));

  function retournerTout() {
    const retournee = !toutesRetournees;
    for (const carte of cartes) {
      carte.retournee = retournee;
    }
  }
</script>

<svelte:head>
  <title>Les cartes · Atout faire</title>
</svelte:head>

<main>
  <h1>Les cartes</h1>
  <p class="aide">
    Une carte par catégorie. Touchez une carte pour la retourner.
  </p>

  <button type="button" class="bouton" onclick={retournerTout}>
    {toutesRetournees ? "Tout remettre face visible" : "Tout retourner"}
  </button>

  <ul class="grille">
    {#each cartes as carte (carte.id)}
      <li>
        <button
          type="button"
          class="zone-carte"
          aria-pressed={carte.retournee}
          onclick={() => (carte.retournee = !carte.retournee)}
        >
          <CarteTache {carte} />
        </button>
      </li>
    {/each}
  </ul>

  <a class="retour" href={resolve("/")}>Retour à l'accueil</a>
</main>

<style>
  main {
    max-width: 480px;
    margin: 0 auto;
    padding: 24px 0 32px;
  }

  h1 {
    margin: 0;
    font-size: 1.8rem;
  }

  .aide {
    margin: 4px 0 16px;
    color: var(--texte-doux);
  }

  .bouton {
    min-height: 44px;
    padding: 0 18px;
    border: none;
    border-radius: 999px;
    background: var(--texte);
    color: var(--fond);
    font: inherit;
    font-weight: 700;
  }

  .grille {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 14px;
    margin: 20px 0;
    padding: 0;
    list-style: none;
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

  .retour {
    display: inline-flex;
    align-items: center;
    min-height: 44px;
    color: var(--texte);
    font-weight: 700;
  }
</style>
