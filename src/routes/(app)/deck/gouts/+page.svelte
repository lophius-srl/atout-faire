<script lang="ts">
  import { enhance } from "$app/forms";
  import { resolve } from "$app/paths";
  import { trouverCategorie } from "$lib/categories";
  import { GOUT_PAR_DEFAUT, GOUTS } from "$lib/gouts";
  import type { ActionData, PageData } from "./$types";

  let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<svelte:head>
  <title>Mes goûts · Atout faire</title>
</svelte:head>

<a class="retour" href={resolve("/deck")}>← Le deck</a>
<h1>Mes goûts</h1>
<p class="aide">
  Dis ce que tu aimes faire ou pas : la balance en tiendra compte. Tes goûts
  restent privés.
</p>

{#if form?.erreur}
  <p class="message-erreur" role="alert">{form.erreur}</p>
{/if}

{#if data.taches.length === 0}
  <p class="aide">Ajoute d'abord des tâches dans le deck.</p>
{:else}
  <ul class="liste">
    {#each data.taches as tache (tache.id)}
      {@const categorie = trouverCategorie(tache.categorie)}
      {@const actuel = data.gouts[tache.id] ?? GOUT_PAR_DEFAUT}
      <li
        class="tache"
        style:--couleur={categorie.couleur}
        style:--encre={categorie.encre}
      >
        <span class="nom">{tache.nom}</span>
        <form method="POST" action="?/choisir" class="choix" use:enhance>
          <input type="hidden" name="tache" value={tache.id} />
          {#each GOUTS as gout (gout.id)}
            <button
              type="submit"
              name="gout"
              value={gout.id}
              class="gout"
              aria-pressed={actuel === gout.id}
              aria-label={`${tache.nom} : ${gout.libelle}`}
            >
              <span aria-hidden="true">{gout.emoji}</span>
              {gout.libelle}
            </button>
          {/each}
        </form>
      </li>
    {/each}
  </ul>
{/if}

<style>
  h1 {
    margin: 4px 0 4px;
    font-size: 1.8rem;
  }

  .aide {
    color: var(--texte-doux);
  }

  .retour {
    display: inline-flex;
    align-items: center;
    min-height: 44px;
    color: var(--texte);
    font-weight: 700;
  }

  .liste {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin: 16px 0 0;
    padding: 0;
    list-style: none;
  }

  .tache {
    padding: 12px;
    border-radius: 14px;
    background: var(--couleur);
    color: var(--encre);
    box-shadow: var(--carte-ombre);
  }

  .nom {
    display: block;
    margin-bottom: 8px;
    font-size: 1.05rem;
    font-weight: 800;
  }

  .choix {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 6px;
  }

  .gout {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 56px;
    padding: 4px;
    border: 2px solid transparent;
    border-radius: 12px;
    background: rgb(255 255 255 / 60%);
    color: var(--encre);
    font: inherit;
    font-size: 0.75rem;
    font-weight: 700;
  }

  .gout span {
    font-size: 1.4rem;
  }

  .gout[aria-pressed="true"] {
    border-color: var(--encre);
    background: #fff;
  }
</style>
