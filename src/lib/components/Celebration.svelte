<script lang="ts">
  import { duree } from "$lib/animations";
  import { aFeter, type Progression } from "$lib/progression";
  import { untrack } from "svelte";
  import { fade, scale } from "svelte/transition";

  let { progression }: { progression: Progression } = $props();

  const MESSAGES = {
    jour: {
      emoji: "🎉",
      titre: "Journée terminée !",
      texte: "Toutes les cartes du jour sont retournées. Bravo à vous deux.",
    },
    semaine: {
      emoji: "🏆",
      titre: "Semaine terminée !",
      texte:
        "Toutes les cartes de la semaine sont retournées. Bravo à vous deux.",
    },
  } as const;
  const COULEURS = [
    "#ffd9c7",
    "#d6ecff",
    "#ffe3f1",
    "#e7e1ff",
    "#dcf5d9",
    "#fff1c2",
    "#f6b26b",
  ];

  // État de départ : on ne fête que ce qui se termine pendant qu'on regarde
  // (une carte retournée ici ou, en direct, sur l'autre téléphone).
  let precedente = untrack(() => progression);
  let fete = $state<"jour" | "semaine" | null>(null);

  let minuterie: ReturnType<typeof setTimeout> | undefined;

  $effect(() => {
    const quoi = aFeter(precedente, progression);
    precedente = progression;
    if (!quoi) return;
    fete = quoi;
    clearTimeout(minuterie);
    minuterie = setTimeout(() => (fete = null), 3500);
  });

  const confettis = Array.from({ length: 28 }, (_, i) => ({
    gauche: (i * 37) % 100,
    retard: (i % 7) * 0.12,
    couleur: COULEURS[i % COULEURS.length],
    rotation: (i * 53) % 360,
  }));
</script>

{#if fete}
  {@const message = MESSAGES[fete]}
  <div
    class="celebration"
    role="status"
    aria-live="polite"
    transition:fade={{ duration: duree(200) }}
  >
    <div class="confettis" aria-hidden="true">
      {#each confettis as c, i (i)}
        <span
          style:left={`${c.gauche}%`}
          style:animation-delay={`${c.retard}s`}
          style:background={c.couleur}
          style:--rotation={`${c.rotation}deg`}
        ></span>
      {/each}
    </div>
    <div
      class="message"
      transition:scale={{ start: 0.8, duration: duree(300) }}
    >
      <span class="emoji" aria-hidden="true">{message.emoji}</span>
      <strong>{message.titre}</strong>
      <p>{message.texte}</p>
      <button
        type="button"
        class="bouton-principal"
        onclick={() => (fete = null)}>Super !</button
      >
    </div>
  </div>
{/if}

<style>
  .celebration {
    position: fixed;
    inset: 0;
    z-index: 20;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    background: rgb(255 248 240 / 70%);
    overflow: hidden;
  }

  .message {
    max-width: 320px;
    padding: 24px;
    border-radius: var(--rayon);
    background: #fff;
    box-shadow: var(--carte-ombre);
    text-align: center;
  }

  .emoji {
    display: block;
    font-size: 3rem;
  }

  strong {
    display: block;
    margin-top: 6px;
    font-size: 1.4rem;
  }

  .message .bouton-principal {
    width: 100%;
    margin-top: 16px;
  }

  p {
    margin: 6px 0 0;
    color: var(--texte-doux);
  }

  .confettis span {
    position: absolute;
    top: -20px;
    width: 10px;
    height: 16px;
    border-radius: 3px;
    animation: tombe 2.6s ease-in forwards;
  }

  @keyframes tombe {
    to {
      transform: translateY(110vh) rotate(var(--rotation));
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .confettis {
      display: none;
    }
  }
</style>
