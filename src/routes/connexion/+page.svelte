<script lang="ts">
  import { enhance } from "$app/forms";
  import { avecRetour } from "$lib/formulaire";
  import type { ActionData, PageData } from "./$types";

  let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<svelte:head>
  <title>Connexion · Atout faire</title>
</svelte:head>

<main class="page-formulaire">
  <h1>Atout faire</h1>

  {#if form?.codeEnvoye}
    <p>
      Un e-mail est parti vers <strong>{form.email}</strong>. Touche le lien
      qu'il contient depuis ce téléphone, ou tape le code s'il y en a un.
    </p>
    <form
      method="POST"
      action="?/verifier"
      use:enhance={avecRetour(undefined, { erreursDansLaPage: true })}
    >
      <input type="hidden" name="email" value={form.email} />
      <label for="code">Code reçu par e-mail</label>
      <input
        id="code"
        name="code"
        inputmode="numeric"
        autocomplete="one-time-code"
        required
      />
      <button type="submit" class="bouton-principal">Me connecter</button>
    </form>
    <form
      method="POST"
      action="?/envoyer"
      use:enhance={avecRetour(undefined, { erreursDansLaPage: true })}
    >
      <input type="hidden" name="email" value={form.email} />
      <button type="submit" class="secondaire">Renvoyer un e-mail</button>
    </form>
  {:else}
    <p>
      Connecte-toi avec ton e-mail : tu recevras un code, sans mot de passe.
    </p>
    {#if data.lienInvalide}
      <p class="message-erreur" role="alert">
        Ce lien a expiré. Demande un nouvel e-mail.
      </p>
    {/if}
    <form
      method="POST"
      action="?/envoyer"
      use:enhance={avecRetour(undefined, { erreursDansLaPage: true })}
    >
      <label for="email">Adresse e-mail</label>
      <input
        id="email"
        name="email"
        type="email"
        autocomplete="email"
        value={form?.email ?? ""}
        required
      />
      <button type="submit" class="bouton-principal">Recevoir mon code</button>
    </form>
  {/if}

  {#if form?.erreur}
    <p class="message-erreur" role="alert">{form.erreur}</p>
  {/if}
</main>

<style>
  .secondaire {
    min-height: 44px;
    border: none;
    background: transparent;
    color: var(--texte);
    font: inherit;
    text-decoration: underline;
  }
</style>
