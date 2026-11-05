<script lang="ts">
  import { enhance } from "$app/forms";
  import { libelleEcheance, type Carte } from "$lib/cartes";
  import { trouverCategorie } from "$lib/categories";
  import { avecRetour } from "$lib/formulaire";
  import { DEPENDANCE_CARTES } from "$lib/temps-reel";

  let { cartes }: { cartes: { carte: Carte; dejaRemerciee: boolean }[] } =
    $props();
</script>

<section>
  <h2>Fait par l'autre</h2>
  <ul>
    {#each cartes as { carte, dejaRemerciee } (carte.id)}
      {@const categorie = trouverCategorie(carte.categorie)}
      <li style:--couleur={categorie.couleur} style:--encre={categorie.encre}>
        <span class="tache"
          >{carte.tache} · {libelleEcheance(carte.echeance)}</span
        >
        {#if dejaRemerciee}
          <span class="dit">💛 Merci dit</span>
        {:else}
          <form
            method="POST"
            action="?/direMerci"
            use:enhance={avecRetour("Merci envoyé 💛", {
              recharger: DEPENDANCE_CARTES,
            })}
          >
            <input type="hidden" name="carte" value={carte.id} />
            <button type="submit" class="secondaire">💛 Merci</button>
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
    gap: 8px;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  li {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    min-height: 52px;
    padding: 4px 6px 4px 14px;
    border-radius: 14px;
    background: var(--couleur);
    color: var(--encre);
  }

  .tache {
    font-weight: 700;
  }

  .dit {
    padding: 0 10px;
    white-space: nowrap;
    font-size: 0.85rem;
    font-weight: 700;
  }

  button {
    min-height: 44px;
    padding: 0 14px;
    border: none;
    border-radius: 999px;
    background: #fff;
    color: var(--encre);
    font: inherit;
    font-weight: 800;
    white-space: nowrap;
  }
</style>
