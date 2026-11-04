<script lang="ts">
  import { enhance } from "$app/forms";
  import Balance from "$lib/components/Balance.svelte";
  import CarteTache from "$lib/components/Carte.svelte";
  import { separerMain } from "$lib/main";
  import type { ActionData, PageData } from "./$types";

  let { data, form }: { data: PageData; form: ActionData } = $props();

  const main = $derived(separerMain(data.maMain));

  const sections = $derived([
    {
      titre: "À faire",
      cartes: main.aFaire,
      vide: "Plus rien à faire. Bravo !",
      action: { faite: "oui", libelle: "Fait !" },
    },
    {
      titre: "Retournées",
      cartes: main.retournees,
      vide: "Aucune carte retournée pour l'instant.",
      action: { faite: "non", libelle: "Remettre à faire" },
    },
  ]);
</script>

<svelte:head>
  <title>Ma main · Atout faire</title>
</svelte:head>

<h1>Ma main</h1>
<p class="aide">Les cartes que tu as prises cette semaine.</p>

{#if data.semaineFinie}
  <p class="semaine-finie" role="status">
    🎉 Toutes les cartes de la semaine sont retournées. La semaine est finie !
  </p>
{/if}
{#if form?.erreur}
  <p class="message-erreur" role="alert">{form.erreur}</p>
{/if}

<Balance poidsMoi={data.poids.moi} poidsAutre={data.poids.autre} />

{#each sections as section (section.titre)}
  <section>
    <h2>{section.titre}</h2>
    {#if section.cartes.length === 0}
      <p class="vide">{section.vide}</p>
    {:else}
      <ul class="grille">
        {#each section.cartes as carte (carte.id)}
          <li class="emplacement">
            <CarteTache {carte} />
            <form method="POST" action="?/retourner" use:enhance>
              <input type="hidden" name="carte" value={carte.id} />
              <input type="hidden" name="faite" value={section.action.faite} />
              <button
                type="submit"
                class="action"
                class:secondaire={section.action.faite === "non"}
              >
                {section.action.libelle}
              </button>
            </form>
          </li>
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

  .semaine-finie {
    padding: 14px 16px;
    border-radius: var(--rayon);
    background: #dcf5d9;
    color: #3a7a35;
    font-weight: 800;
    text-align: center;
  }

  .emplacement {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .action {
    width: 100%;
    min-height: 44px;
    border: none;
    border-radius: 999px;
    background: var(--texte);
    color: var(--fond);
    font: inherit;
    font-weight: 700;
  }

  .action.secondaire {
    background: transparent;
    color: var(--texte);
    text-decoration: underline;
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
