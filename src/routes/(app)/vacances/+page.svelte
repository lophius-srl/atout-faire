<script lang="ts">
  import { enhance } from "$app/forms";
  import { avecRetour } from "$lib/formulaire";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();
</script>

<svelte:head>
  <title>Nos vacances · Atout faire</title>
</svelte:head>

<h1>Nos vacances</h1>
<p class="aide">
  Pendant vos vacances, le deck ne distribue aucune carte. Les cartes encore à
  faire de la période quittent le Marché et vos mains. Une semaine entièrement
  en vacances ne compte pas pour le bâtiment : vous ne perdez rien.
</p>

<form
  method="POST"
  action="?/planifier"
  class="periode"
  use:enhance={avecRetour("Vacances enregistrées 🌴")}
>
  <label for="debut">Départ</label>
  <input
    id="debut"
    name="debut"
    type="date"
    value={data.vacances?.debut ?? ""}
    min={data.enCours ? data.vacances?.debut : data.aujourdhui}
    readonly={data.enCours}
    required
  />
  <label for="fin">Retour (dernier jour de vacances)</label>
  <input
    id="fin"
    name="fin"
    type="date"
    value={data.vacances?.fin ?? ""}
    min={data.aujourdhui}
    required
  />
  <button type="submit" class="bouton-principal">
    {data.vacances ? "Modifier les dates" : "Partir en vacances"}
  </button>
</form>

{#if data.vacances}
  <form
    method="POST"
    action="?/annuler"
    class="annuler"
    use:enhance={avecRetour(
      data.enCours ? "Bon retour à la maison 🏠" : "Vacances annulées",
    )}
  >
    <button type="submit" class="secondaire">
      {data.enCours
        ? "Nous sommes rentrés : les cartes reprennent aujourd’hui"
        : "Annuler les vacances"}
    </button>
  </form>
{/if}

<style>
  h1 {
    margin: 0;
    font-size: 1.8rem;
  }

  .aide {
    color: var(--texte-doux);
  }

  .periode {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 14px;
    border-radius: var(--rayon);
    background: var(--surface);
    box-shadow: var(--carte-ombre);
  }

  label {
    font-weight: 700;
  }

  input {
    min-height: 48px;
    padding: 0 12px;
    border: 2px solid var(--bordure);
    border-radius: 14px;
    background: var(--surface);
    font: inherit;
  }

  input[readonly] {
    color: var(--texte-doux);
  }

  .annuler {
    margin-top: 12px;
  }

  .annuler button {
    width: 100%;
    min-height: 48px;
    border: 2px solid var(--texte);
    border-radius: 999px;
    background: var(--surface);
    color: var(--texte);
    font: inherit;
    font-weight: 700;
  }
</style>
