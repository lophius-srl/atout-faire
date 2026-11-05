<script lang="ts">
  import { enhance } from "$app/forms";
  import { resolve } from "$app/paths";
  import { trouverCategorie } from "$lib/categories";
  import {
    estPassee,
    libelleFrequence,
    libellePenibilite,
    libelleSemaine,
  } from "$lib/deck";
  import { prochaineSemaineDuMois } from "$lib/distribution";
  import { avecRetour } from "$lib/formulaire";
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
  <form
    method="POST"
    action="?/ajouterModeles"
    class="modeles"
    use:enhance={avecRetour("Tâches ajoutées au deck")}
  >
    <h2>Démarrer avec des tâches courantes</h2>
    <p class="aide">
      Coche celles qui vous concernent : tu pourras les ajuster ensuite.
    </p>
    <ul>
      {#each data.modeles as modele (modele.nom)}
        {@const categorie = trouverCategorie(modele.categorie)}
        <li>
          <label
            class="modele"
            style:--couleur={categorie.couleur}
            style:--encre={categorie.encre}
          >
            <input type="checkbox" name="modele" value={modele.nom} />
            <span class="nom">{modele.nom}</span>
            <span class="details"
              >{libelleFrequence(modele)} · {libellePenibilite(
                modele.penibilite,
              )}</span
            >
          </label>
        </li>
      {/each}
    </ul>
    <button type="submit" class="bouton-principal"
      >Ajouter les tâches cochées</button
    >
  </form>
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
          <span class="nom"
            >{tache.nom}
            {#if estPassee(tache, data.aujourdhui)}<span class="passee"
                >passée</span
              >{/if}</span
          >
          <span class="details">
            {categorie.nom} · {libelleFrequence(
              tache,
            )}{#if tache.frequence === "mensuelle"}
              ({libelleSemaine(prochaineSemaineDuMois(data.aujourdhui))}){/if}
            · {libellePenibilite(tache.penibilite)}
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

  .aide {
    color: var(--texte-doux);
  }

  .actions {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .passee {
    margin-left: 6px;
    padding: 1px 8px;
    border-radius: 999px;
    background: var(--fond);
    color: var(--texte-doux);
    font-size: 0.75rem;
    font-weight: 700;
  }

  .lien-gouts {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 44px;
    color: var(--texte);
    font-weight: 700;
  }

  .modeles {
    margin-top: 20px;
  }

  .modeles h2 {
    margin: 0;
    font-size: 1.15rem;
  }

  .modeles ul {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin: 12px 0 16px;
    padding: 0;
    list-style: none;
  }

  .modele {
    display: grid;
    grid-template-columns: auto 1fr;
    column-gap: 12px;
    align-items: center;
    min-height: 52px;
    padding: 8px 14px;
    border-radius: 14px;
    background: var(--couleur);
    color: var(--encre);
    cursor: pointer;
  }

  .modele input {
    grid-row: span 2;
    width: 22px;
    height: 22px;
    accent-color: var(--encre);
  }

  .modele .nom {
    font-weight: 800;
  }

  .modele .details {
    font-size: 0.8rem;
    font-weight: 600;
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
