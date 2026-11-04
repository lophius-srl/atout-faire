<script lang="ts">
  import { enhance } from "$app/forms";
  import { avecRetour } from "$lib/formulaire";
  import { untrack } from "svelte";
  import { JOURS } from "$lib/cartes";
  import { CATEGORIES } from "$lib/categories";
  import { libellePenibilite, NOM_MAX, type SaisieTache } from "$lib/deck";

  let {
    tache,
    parents,
    erreur,
    libelleBouton,
  }: {
    tache: SaisieTache;
    parents: { id: string; nom: string }[];
    erreur?: string;
    libelleBouton: string;
  } = $props();

  // Copie locale : le formulaire garde la saisie, même après une erreur.
  let frequence = $state(untrack(() => tache.frequence));
</script>

<form
  method="POST"
  action="?/enregistrer"
  class="formulaire"
  use:enhance={avecRetour("Tâche enregistrée", { erreursDansLaPage: true })}
>
  <label for="nom">Nom de la tâche</label>
  <input id="nom" name="nom" value={tache.nom} maxlength={NOM_MAX} required />

  <fieldset>
    <legend>Catégorie</legend>
    <div class="choix">
      {#each CATEGORIES as categorie (categorie.id)}
        <label
          class="pastille"
          style:--couleur={categorie.couleur}
          style:--encre={categorie.encre}
        >
          <input
            type="radio"
            name="categorie"
            value={categorie.id}
            checked={tache.categorie === categorie.id}
            required
          />
          {categorie.nom}
        </label>
      {/each}
    </div>
  </fieldset>

  <fieldset>
    <legend>Fréquence</legend>
    <div class="choix">
      <label class="pastille">
        <input
          type="radio"
          name="frequence"
          value="quotidienne"
          bind:group={frequence}
        />
        Certains jours
      </label>
      <label class="pastille">
        <input
          type="radio"
          name="frequence"
          value="hebdomadaire"
          bind:group={frequence}
        />
        Une fois par semaine
      </label>
    </div>
    {#if frequence === "quotidienne"}
      <div class="choix jours">
        {#each JOURS as jour, index (jour)}
          <label class="pastille">
            <input
              type="checkbox"
              name="jours"
              value={index + 1}
              checked={tache.jours?.includes(index + 1)}
            />
            {jour.charAt(0).toUpperCase() + jour.slice(1, 3)}
          </label>
        {/each}
      </div>
    {/if}
  </fieldset>

  <fieldset>
    <legend>Pénibilité</legend>
    <div class="choix">
      {#each [1, 2, 3] as const as niveau (niveau)}
        <label class="pastille">
          <input
            type="radio"
            name="penibilite"
            value={niveau}
            checked={tache.penibilite === niveau}
            required
          />
          {libellePenibilite(niveau)}
        </label>
      {/each}
    </div>
  </fieldset>

  <label for="fixePour">Réservée à</label>
  <select id="fixePour" name="fixePour">
    <option value="">Personne (Marché)</option>
    {#each parents as parent (parent.id)}
      <option value={parent.id} selected={tache.fixePour === parent.id}
        >{parent.nom}</option
      >
    {/each}
  </select>

  {#if erreur}
    <p class="message-erreur" role="alert">{erreur}</p>
  {/if}

  <button type="submit" class="bouton-principal">{libelleBouton}</button>
</form>

<style>
  .formulaire {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  label,
  legend {
    font-weight: 700;
  }

  #nom,
  select {
    min-height: 48px;
    padding: 0 14px;
    border: 2px solid #e8ddd5;
    border-radius: 14px;
    background: #fff;
    font: inherit;
    font-size: 1.05rem;
  }

  fieldset {
    margin: 0;
    padding: 0;
    border: none;
  }

  legend {
    margin-bottom: 8px;
  }

  .choix {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .jours {
    margin-top: 8px;
  }

  .pastille {
    display: inline-flex;
    align-items: center;
    min-height: 44px;
    padding: 0 14px;
    border: 2px solid var(--encre, #e8ddd5);
    border-radius: 999px;
    background: #fff;
    color: var(--encre, var(--texte));
    font-weight: 700;
    cursor: pointer;
  }

  .pastille:has(input:checked) {
    background: var(--couleur, var(--texte));
    color: var(--encre, var(--fond));
  }

  .pastille input {
    position: absolute;
    opacity: 0;
    pointer-events: none;
  }

  .pastille:has(input:focus-visible) {
    outline: 3px solid #f6b26b;
  }
</style>
