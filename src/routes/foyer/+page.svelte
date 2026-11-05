<script lang="ts">
  import { enhance } from "$app/forms";
  import { avecRetour } from "$lib/formulaire";
  import { resolve } from "$app/paths";
  import type { ActionData, PageData } from "./$types";

  let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<svelte:head>
  <title>Mon foyer · Atout faire</title>
</svelte:head>

<main class="page-formulaire">
  <h1>Mon foyer</h1>

  {#if data.foyer}
    {#if data.foyer.nombreDeMembres < 2}
      <p>
        Invite l'autre parent : donne-lui ce code pour qu'il rejoigne votre
        foyer.
      </p>
      <p class="code">{data.foyer.codeInvitation}</p>
    {:else}
      <p>Votre foyer est complet : vous êtes deux. 🎉</p>
    {/if}
    <a class="bouton-principal" href={resolve("/marche")}>Aller au Marché</a>
  {:else}
    <p>Crée votre foyer, ou rejoins celui de l'autre parent avec son code.</p>
    <form
      method="POST"
      action="?/creer"
      use:enhance={avecRetour(undefined, { erreursDansLaPage: true })}
    >
      <button type="submit" class="bouton-principal">Créer notre foyer</button>
    </form>
    <form
      method="POST"
      action="?/rejoindre"
      use:enhance={avecRetour(undefined, { erreursDansLaPage: true })}
    >
      <label for="code">Code d'invitation</label>
      <input
        id="code"
        name="code"
        autocapitalize="characters"
        value={form?.code ?? ""}
        required
      />
      <button type="submit" class="bouton-principal">Rejoindre le foyer</button>
    </form>
  {/if}

  {#if form?.erreur}
    <p class="message-erreur" role="alert">{form.erreur}</p>
  {/if}
</main>

<style>
  input {
    text-transform: uppercase;
  }

  .code {
    padding: 16px;
    border-radius: var(--rayon);
    background: var(--surface);
    box-shadow: var(--carte-ombre);
    font-size: 2rem;
    font-weight: 800;
    letter-spacing: 0.2em;
    text-align: center;
  }
</style>
