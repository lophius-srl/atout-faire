<script lang="ts">
  import { resolve } from "$app/paths";
  import FormulaireTache from "$lib/components/FormulaireTache.svelte";
  import type { ActionData, PageData } from "./$types";

  let { data, form }: { data: PageData; form: ActionData } = $props();

  const vide = {
    nom: "",
    categorie: "maison",
    frequence: "quotidienne",
    jours: [],
    penibilite: 2,
    fixePour: null,
  } as const;
</script>

<svelte:head>
  <title>Nouvelle tâche · Atout faire</title>
</svelte:head>

<a class="retour" href={resolve("/deck")}>← Le deck</a>
<h1>Nouvelle tâche</h1>

<FormulaireTache
  tache={{ ...vide, jours: [] }}
  parents={data.parents}
  erreur={form?.erreur}
  libelleBouton="Ajouter au deck"
/>

<style>
  h1 {
    margin: 4px 0 16px;
    font-size: 1.8rem;
  }

  .retour {
    display: inline-flex;
    align-items: center;
    min-height: 44px;
    color: var(--texte);
    font-weight: 700;
  }
</style>
