<script lang="ts">
  import { enhance } from "$app/forms";
  import { avecRetour } from "$lib/formulaire";
  import { resolve } from "$app/paths";
  import FormulaireTache from "$lib/components/FormulaireTache.svelte";
  import type { ActionData, PageData } from "./$types";

  let { data, form }: { data: PageData; form: ActionData } = $props();

  function confirmerSuppression(event: SubmitEvent) {
    if (
      !confirm(
        `Supprimer « ${data.tache.nom} » du deck ? Ses cartes encore à faire quitteront le Marché et les mains.`,
      )
    )
      event.preventDefault();
  }
</script>

<svelte:head>
  <title>{data.tache.nom} · Atout faire</title>
</svelte:head>

<a class="retour" href={resolve("/deck")}>← Le deck</a>
<h1>Modifier la tâche</h1>
<p class="aide">
  Les changements s'appliquent aux prochaines cartes. Supprimer la tâche retire
  aussi ses cartes encore à faire.
</p>

<FormulaireTache
  tache={data.tache}
  parents={data.parents}
  aujourdhui={data.aujourdhui}
  erreur={form?.erreur}
  libelleBouton="Enregistrer"
/>

<form
  method="POST"
  action="?/supprimer"
  onsubmit={confirmerSuppression}
  use:enhance={avecRetour("Tâche supprimée")}
>
  <button type="submit" class="supprimer">Supprimer cette tâche</button>
</form>

<style>
  h1 {
    margin: 4px 0 4px;
    font-size: 1.8rem;
  }

  .aide {
    margin: 0 0 16px;
    color: var(--texte-doux);
  }

  .retour {
    display: inline-flex;
    align-items: center;
    min-height: 44px;
    color: var(--texte);
    font-weight: 700;
  }

  .supprimer {
    width: 100%;
    min-height: 44px;
    margin-top: 16px;
    border: none;
    background: none;
    color: var(--erreur);
    font: inherit;
    font-weight: 700;
    text-decoration: underline;
  }
</style>
