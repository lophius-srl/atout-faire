<script lang="ts">
  import { enhance } from "$app/forms";
  import type { Carte } from "$lib/cartes";
  import { avecRetour } from "$lib/formulaire";
  import CarteTache from "./Carte.svelte";

  let {
    carte,
    peutEchanger,
    ouverte,
    basculer,
  }: {
    carte: Carte;
    peutEchanger: boolean;
    ouverte: boolean;
    basculer: () => void;
  } = $props();

  const actions = $derived(
    carte.retournee
      ? [
          {
            action: "retourner",
            faite: "non",
            libelle: "↺ Remettre à faire",
            message: "Carte remise à faire",
          },
        ]
      : [
          {
            action: "retourner",
            faite: "oui",
            libelle: "✓ Fait",
            message: "Bien joué ✓",
          },
          ...(peutEchanger
            ? [
                {
                  action: "proposerEchange",
                  faite: "",
                  libelle: "⇄ Échanger",
                  message: "Échange proposé ⇄",
                },
              ]
            : []),
          {
            action: "remettreAuMarche",
            faite: "",
            libelle: "↩ Marché",
            message: "Carte repartie sur le Marché",
          },
        ],
  );
</script>

<div class="carte-avec-actions">
  <button
    type="button"
    class="zone-carte"
    aria-expanded={ouverte}
    aria-label={`${carte.tache} : afficher les actions`}
    onclick={basculer}
  >
    <CarteTache {carte} />
  </button>

  {#if ouverte}
    <div
      class="actions"
      role="group"
      aria-label={`Actions pour ${carte.tache}`}
    >
      {#each actions as { action, faite, libelle, message } (action + faite)}
        <form
          method="POST"
          action={`?/${action}`}
          use:enhance={avecRetour(message)}
        >
          <input type="hidden" name="carte" value={carte.id} />
          {#if faite}<input type="hidden" name="faite" value={faite} />{/if}
          <button type="submit" class="action">{libelle}</button>
        </form>
      {/each}
    </div>
  {/if}
</div>

<style>
  .carte-avec-actions {
    position: relative;
  }

  .zone-carte {
    display: block;
    width: 100%;
    padding: 0;
    border: none;
    background: none;
    font: inherit;
    text-align: left;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }

  .actions {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 8px;
    padding: 12px;
    border-radius: var(--rayon);
    background: rgb(255 248 240 / 88%);
    backdrop-filter: blur(3px);
  }

  .titre {
    margin: 0 0 2px;
    font-weight: 800;
    line-height: 1.2;
    text-align: center;
  }

  .action {
    width: 100%;
    min-height: 44px;
    border: none;
    border-radius: 999px;
    background: var(--texte);
    color: var(--fond);
    font: inherit;
    font-weight: 800;
  }
</style>
