<script lang="ts">
  import { enhance } from "$app/forms";
  import { avecRetour } from "$lib/formulaire";
  import { trouverCategorie, type CategorieId } from "$lib/categories";
  import type { Reponse } from "$lib/echanges";

  interface ResumeCarte {
    tache: string;
    categorie: CategorieId;
    echeance: string;
  }

  let {
    echanges,
    aDonner,
  }: {
    echanges: {
      id: string;
      offerte: ResumeCarte | null;
      contre: ResumeCarte | null;
      situation: string;
      reponses: { reponse: Reponse; demandeUneCarte: boolean }[];
    }[];
    aDonner: { id: string; libelle: string }[];
  } = $props();

  const LIBELLES: Record<Reponse, string> = {
    accepter: "Accepter",
    contre_proposer: "Contre-proposer",
    refuser: "Refuser",
  };
</script>

{#snippet pastille(carte: ResumeCarte)}
  {@const categorie = trouverCategorie(carte.categorie)}
  <span
    class="pastille"
    style:--couleur={categorie.couleur}
    style:--encre={categorie.encre}
  >
    {carte.tache} · {carte.echeance}
  </span>
{/snippet}

<section class="echanges">
  <h2>Échanges</h2>
  <ul>
    {#each echanges as echange (echange.id)}
      <li class="echange" class:a-repondre={echange.reponses.length > 0}>
        <p class="situation">{echange.situation}</p>
        <p class="cartes">
          {#if echange.offerte}{@render pastille(echange.offerte)}{/if}
          {#if echange.contre}
            <span aria-hidden="true">⇄</span>
            {@render pastille(echange.contre)}
          {/if}
        </p>

        {#if echange.reponses.length > 0}
          <form
            method="POST"
            action="?/repondreEchange"
            class="reponse"
            use:enhance={avecRetour("Réponse envoyée")}
          >
            <input type="hidden" name="echange" value={echange.id} />
            {#if echange.reponses.some((r) => r.demandeUneCarte)}
              <label for={`carte-${echange.id}`}
                >Une de tes cartes en échange</label
              >
              <select id={`carte-${echange.id}`} name="maCarte">
                {#each aDonner as carte (carte.id)}
                  <option value={carte.id}>{carte.libelle}</option>
                {:else}
                  <option value="">Aucune carte à donner</option>
                {/each}
              </select>
            {/if}
            <div class="boutons">
              {#each echange.reponses as { reponse } (reponse)}
                <button
                  type="submit"
                  name="reponse"
                  value={reponse}
                  class:refuser={reponse === "refuser"}
                >
                  {LIBELLES[reponse]}
                </button>
              {/each}
            </div>
          </form>
        {/if}
      </li>
    {/each}
  </ul>
</section>

<style>
  h2 {
    margin: 24px 0 12px;
    font-size: 1.15rem;
  }

  ul {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .echange {
    padding: 12px;
    border-radius: 14px;
    background: #fff;
    box-shadow: var(--carte-ombre);
  }

  .a-repondre {
    box-shadow: 0 0 0 3px #f6b26b;
  }

  .situation {
    margin: 0 0 6px;
    font-weight: 800;
  }

  .cartes {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px;
    margin: 0;
  }

  .pastille {
    padding: 4px 10px;
    border-radius: 999px;
    background: var(--couleur);
    color: var(--encre);
    font-size: 0.85rem;
    font-weight: 700;
  }

  .reponse {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-top: 10px;
  }

  label {
    font-size: 0.85rem;
    font-weight: 700;
  }

  select {
    min-height: 44px;
    padding: 0 10px;
    border: 2px solid #e8ddd5;
    border-radius: 12px;
    background: #fff;
    font: inherit;
  }

  .boutons {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .boutons button {
    flex: 1;
    min-height: 44px;
    padding: 0 12px;
    border: none;
    border-radius: 999px;
    background: var(--texte);
    color: var(--fond);
    font: inherit;
    font-weight: 700;
  }

  .boutons .refuser {
    background: transparent;
    color: var(--texte);
    text-decoration: underline;
  }
</style>
