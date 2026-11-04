<script lang="ts">
  import { resolve } from "$app/paths";
  import { trouverCategorie } from "$lib/categories";
  import { libelleFrequence, libellePenibilite } from "$lib/deck";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();

  const nomParent = (id: string) =>
    data.parents.find((p) => p.id === id)?.nom ?? "un parent";
</script>

<svelte:head>
  <title>Deck · Atout faire</title>
</svelte:head>

<h1>Le deck</h1>
<p class="aide">
  Les tâches de la maison. Chacune donnera des cartes sur le Marché.
</p>

<div class="actions">
  <a class="bouton-principal" href={resolve("/deck/nouvelle")}
    >Ajouter une tâche</a
  >
  <a class="lien-gouts" href={resolve("/deck/gouts")}>😊 Mes goûts</a>
</div>

{#if data.taches.length === 0}
  <p class="vide">
    Aucune tâche pour l'instant. Commence par celles de tous les jours !
  </p>
{:else}
  <ul class="liste">
    {#each data.taches as tache (tache.id)}
      {@const categorie = trouverCategorie(tache.categorie)}
      <li>
        <a
          class="tache"
          href={resolve(`/deck/${tache.id}`)}
          style:--couleur={categorie.couleur}
          style:--encre={categorie.encre}
        >
          <span class="nom">{tache.nom}</span>
          <span class="details">
            {categorie.nom} · {libelleFrequence(tache)} · {libellePenibilite(
              tache.penibilite,
            )}
          </span>
          {#if tache.fixePour}
            <span class="fixe">Réservée à : {nomParent(tache.fixePour)}</span>
          {/if}
        </a>
      </li>
    {/each}
  </ul>
{/if}

<style>
  h1 {
    margin: 0;
    font-size: 1.8rem;
  }

  .aide,
  .vide {
    color: var(--texte-doux);
  }

  .actions {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .lien-gouts {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 44px;
    color: var(--texte);
    font-weight: 700;
  }

  .liste {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin: 20px 0 0;
    padding: 0;
    list-style: none;
  }

  .tache {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-height: 44px;
    padding: 12px 16px;
    border-left: 8px solid var(--encre);
    border-radius: 14px;
    background: var(--couleur);
    color: var(--encre);
    text-decoration: none;
    box-shadow: var(--carte-ombre);
  }

  .nom {
    font-size: 1.1rem;
    font-weight: 800;
  }

  .details,
  .fixe {
    font-size: 0.85rem;
    font-weight: 600;
  }
</style>
