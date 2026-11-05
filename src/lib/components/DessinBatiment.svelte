<script lang="ts">
  import type { Batiment } from "$lib/batiments";

  let {
    batiment,
    allumees,
    description,
  }: {
    batiment: Batiment;
    /** Fenêtres allumées, dans l'ordre. */
    allumees: number;
    description: string;
  } = $props();
</script>

<svg viewBox="0 0 200 140" role="img" aria-label={description}>
  <rect width="200" height="140" fill="#2b2d55" />
  <circle cx="168" cy="22" r="10" fill="#fff1c2" opacity="0.9" />
  <circle cx="20" cy="18" r="1.5" fill="#fff" /><circle
    cx="44"
    cy="34"
    r="1"
    fill="#fff"
  />
  <circle cx="70" cy="14" r="1.2" fill="#fff" /><circle
    cx="140"
    cy="40"
    r="1"
    fill="#fff"
  />
  <circle cx="186" cy="56" r="1.2" fill="#fff" /><circle
    cx="12"
    cy="60"
    r="1"
    fill="#fff"
  />
  <rect y="124" width="200" height="16" fill="#3d5a3b" />

  <!-- Dessin statique défini dans le code (src/lib/batiments.ts), jamais une saisie. -->
  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  {@html batiment.dessin}

  {#each batiment.fenetres as fenetre, i (i)}
    <rect
      class="fenetre"
      class:allumee={i < allumees}
      x={fenetre.x}
      y={fenetre.y}
      width={fenetre.l}
      height={fenetre.h}
      rx="2"
    />
  {/each}
</svg>

<style>
  svg {
    display: block;
    width: 100%;
    height: auto;
  }

  .fenetre {
    fill: #3a3550;
    transition: fill 0.6s ease;
  }

  .fenetre.allumee {
    fill: #ffd66b;
    filter: drop-shadow(0 0 4px #ffd66b);
  }

  @media (prefers-reduced-motion: reduce) {
    .fenetre {
      transition: none;
    }
  }
</style>
