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

    {#if batiment.id === "cabane"}
      <rect x="66" y="84" width="68" height="40" rx="3" fill="#a46a43" />
      <path d="M58 86 100 56l42 30z" fill="#7a4a2c" />
      <rect x="94" y="104" width="12" height="20" rx="2" fill="#5b3820" />
    {:else if batiment.id === "maison"}
      <rect x="56" y="60" width="88" height="64" rx="3" fill="#f2c9a5" />
      <path d="M48 62 100 30l52 32z" fill="#b5523b" />
      <rect x="126" y="34" width="10" height="18" fill="#8e3f2d" />
      <rect x="93" y="98" width="14" height="26" rx="2" fill="#7a4a2c" />
    {:else if batiment.id === "moulin"}
      <path d="M80 124 86 50h28l6 74z" fill="#e8dcc8" />
      <path d="M82 52 100 36l18 16z" fill="#8e3f2d" />
      <g stroke="#c9b79a" stroke-width="5" stroke-linecap="round">
        <path d="M100 44 70 14M100 44l30-30M100 44 70 74M100 44l30 30" />
      </g>
      <circle cx="100" cy="44" r="4" fill="#8e3f2d" />
    {:else if batiment.id === "phare"}
      <path d="M86 124 90 40h20l4 84z" fill="#f5f0e6" />
      <path
        d="M87 104h26M88 84h24M89 64h22"
        stroke="#d1495b"
        stroke-width="7"
      />
      <rect x="84" y="18" width="32" height="22" rx="3" fill="#3a3550" />
      <path d="M82 18 100 6l18 12z" fill="#d1495b" />
    {:else}
      <rect x="40" y="56" width="22" height="68" fill="#b9b3c9" />
      <rect x="138" y="56" width="22" height="68" fill="#b9b3c9" />
      <rect x="60" y="78" width="80" height="46" fill="#cdc7db" />
      <rect x="88" y="44" width="24" height="80" fill="#b9b3c9" />
      <path
        d="M38 58 51 36l13 22zM136 58l13-22 13 22zM86 46l14-24 14 24z"
        fill="#5a46a8"
      />
      <path d="M92 124v-14a8 8 0 0 1 16 0v14z" fill="#5b4a6e" />
    {/if}

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
