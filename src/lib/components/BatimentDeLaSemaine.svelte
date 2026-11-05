<script lang="ts">
  import { batimentDuNiveau, fenetresAllumees } from "$lib/batiments";

  let {
    niveau,
    retournees,
    total,
  }: { niveau: number; retournees: number; total: number } = $props();

  const batiment = $derived(batimentDuNiveau(niveau));
  const suivant = $derived(batimentDuNiveau(niveau + 1));

  const allumees = $derived(
    fenetresAllumees(retournees, total, batiment.fenetres.length),
  );
  const complet = $derived(total > 0 && allumees === batiment.fenetres.length);
  const nom = $derived(
    batiment.nom.charAt(0).toUpperCase() + batiment.nom.slice(1),
  );
</script>

<figure class="batiment" class:complet>
  <svg
    viewBox="0 0 200 140"
    role="img"
    aria-label={`${nom}, ${allumees} fenêtres allumées sur ${batiment.fenetres.length}`}
  >
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
  <figcaption>
    <span class="niveau">Niveau {niveau + 1}</span>
    {#if complet}
      ✨ {nom} brille de mille feux ! La semaine prochaine, niveau {niveau + 2} :
      {suivant.nom}.
    {:else}
      {nom} : {allumees}/{batiment.fenetres.length} fenêtres allumées. Illuminez-{batiment.pronom}
      entièrement pour passer {suivant.destination}.
    {/if}
  </figcaption>
</figure>

<style>
  .batiment {
    margin: 12px 0 16px;
    overflow: hidden;
    border-radius: var(--rayon);
    background: #2b2d55;
    box-shadow: var(--carte-ombre);
  }

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

  figcaption {
    padding: 10px 14px 12px;
    color: #f4efff;
    font-size: 0.9rem;
    font-weight: 600;
  }

  .niveau {
    display: block;
    margin-bottom: 2px;
    color: #b8b2e6;
    font-size: 0.75rem;
    font-weight: 800;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .complet figcaption {
    color: #ffd66b;
    font-weight: 800;
  }

  @media (prefers-reduced-motion: reduce) {
    .fenetre {
      transition: none;
    }
  }
</style>
