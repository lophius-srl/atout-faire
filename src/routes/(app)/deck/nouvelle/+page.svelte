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

{#if data.idees.length > 0}
  <section class="idees" aria-label="Idées de tâches">
    <h2>Idées</h2>
    <ul>
      {#each data.idees as idee (idee.nom)}
        <li>
          <a
            class="idee"
            class:choisie={data.modele?.nom === idee.nom}
            href={resolve(
              `/deck/nouvelle?modele=${encodeURIComponent(idee.nom)}`,
            )}
            data-sveltekit-replacestate
            data-sveltekit-noscroll>{idee.nom}</a
          >
        </li>
      {/each}
    </ul>
  </section>
{/if}

{#key data.modele?.nom}
  <FormulaireTache
    tache={data.modele
      ? { ...data.modele, fixePour: null }
      : { ...vide, jours: [] }}
    parents={data.parents}
    erreur={form?.erreur}
    libelleBouton="Ajouter au deck"
  />
{/key}

<style>
  h1 {
    margin: 4px 0 16px;
    font-size: 1.8rem;
  }

  .idees h2 {
    margin: 0 0 8px;
    font-size: 1rem;
  }

  .idees ul {
    display: flex;
    gap: 8px;
    margin: 0 -16px 20px;
    padding: 0 16px 4px;
    overflow-x: auto;
    list-style: none;
    scrollbar-width: none;
  }

  .idee {
    display: inline-flex;
    align-items: center;
    min-height: 44px;
    padding: 0 14px;
    border: 2px solid #e8ddd5;
    border-radius: 999px;
    background: #fff;
    color: var(--texte);
    font-weight: 700;
    text-decoration: none;
    white-space: nowrap;
  }

  .idee.choisie {
    border-color: var(--texte);
    background: var(--texte);
    color: var(--fond);
  }

  .retour {
    display: inline-flex;
    align-items: center;
    min-height: 44px;
    color: var(--texte);
    font-weight: 700;
  }
</style>
