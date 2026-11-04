<script lang="ts">
  import { duree } from "$lib/animations";
  import { afficherMessage } from "$lib/notifications.svelte";
  import { fly } from "svelte/transition";

  let {
    codeInvitation,
    nombreDeMembres,
  }: { codeInvitation: string; nombreDeMembres: number } = $props();

  let panneauOuvert = $state(false);
  const seul = $derived(nombreDeMembres < 2);
  const peutPartager = typeof navigator !== "undefined" && "share" in navigator;

  async function partagerLeCode() {
    const texte = `Rejoins notre foyer sur Atout faire avec le code ${codeInvitation} : ${location.origin}`;
    try {
      await navigator.share({ title: "Atout faire", text: texte });
    } catch {
      // Partage annulé : rien à faire.
    }
  }

  async function copierLeCode() {
    await navigator.clipboard.writeText(codeInvitation);
    afficherMessage({ texte: "Code copié", type: "succes" });
  }

  function fermerSiAilleurs(event: PointerEvent) {
    if (!(event.target as Element).closest(".barre-haut"))
      panneauOuvert = false;
  }
</script>

<svelte:document
  onpointerdown={fermerSiAilleurs}
  onkeydown={(e) => e.key === "Escape" && (panneauOuvert = false)}
/>

<header class="barre-haut">
  <div class="ligne">
    <span class="nom-app">Atout faire</span>
    <button
      type="button"
      class="bouton-foyer"
      aria-expanded={panneauOuvert}
      aria-controls="panneau-foyer"
      aria-label="Mon foyer"
      onclick={() => (panneauOuvert = !panneauOuvert)}
    >
      🏠{#if seul}<span class="pastille-alerte" aria-hidden="true"></span>{/if}
    </button>
  </div>

  {#if seul && !panneauOuvert}
    <button
      type="button"
      class="bandeau"
      onclick={() => (panneauOuvert = true)}
    >
      Invite l'autre parent : code <strong>{codeInvitation}</strong>
    </button>
  {/if}

  {#if panneauOuvert}
    <div
      id="panneau-foyer"
      class="panneau"
      transition:fly={{ y: -12, duration: duree(180) }}
    >
      <h2>Mon foyer</h2>
      {#if seul}
        <p>
          Tu es seul pour l'instant. Donne ce code à l'autre parent pour qu'il
          vous rejoigne :
        </p>
        <p class="code">{codeInvitation}</p>
        <div class="boutons">
          {#if peutPartager}
            <button
              type="button"
              class="bouton-principal"
              onclick={partagerLeCode}
            >
              Partager le code
            </button>
          {/if}
          <button type="button" class="secondaire" onclick={copierLeCode}
            >Copier le code</button
          >
        </div>
      {:else}
        <p>Vous êtes deux dans ce foyer. 🎉</p>
      {/if}
    </div>
  {/if}
</header>

<style>
  .barre-haut {
    position: sticky;
    top: 0;
    z-index: 5;
    margin: calc(-1 * env(safe-area-inset-top)) -16px 0;
    padding: env(safe-area-inset-top) 16px 0;
    background: rgb(255 248 240 / 94%);
    backdrop-filter: blur(10px);
  }

  .ligne {
    display: flex;
    align-items: center;
    justify-content: space-between;
    max-width: 480px;
    min-height: 52px;
    margin: 0 auto;
  }

  .nom-app {
    font-size: 1.1rem;
    font-weight: 800;
  }

  .bouton-foyer {
    position: relative;
    width: 44px;
    height: 44px;
    border: none;
    border-radius: 50%;
    background: #fff;
    box-shadow: var(--carte-ombre);
    font-size: 1.3rem;
  }

  .pastille-alerte {
    position: absolute;
    top: 6px;
    right: 6px;
    width: 10px;
    height: 10px;
    border: 2px solid #fff;
    border-radius: 50%;
    background: #e8743b;
  }

  .bandeau {
    display: block;
    width: 100%;
    max-width: 480px;
    min-height: 44px;
    margin: 0 auto 8px;
    padding: 8px 14px;
    border: none;
    border-radius: 14px;
    background: #fff1c2;
    color: #8a6414;
    font: inherit;
    font-weight: 600;
  }

  .bandeau strong {
    letter-spacing: 0.1em;
  }

  .panneau {
    max-width: 480px;
    margin: 0 auto 10px;
    padding: 14px 16px;
    border-radius: var(--rayon);
    background: #fff;
    box-shadow: var(--carte-ombre);
  }

  h2 {
    margin: 0 0 6px;
    font-size: 1.1rem;
  }

  .code {
    margin: 8px 0;
    font-size: 2rem;
    font-weight: 800;
    letter-spacing: 0.2em;
    text-align: center;
  }

  .boutons {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .secondaire {
    min-height: 44px;
    border: none;
    background: none;
    color: var(--texte);
    font: inherit;
    font-weight: 700;
    text-decoration: underline;
  }
</style>
