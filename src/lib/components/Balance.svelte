<script lang="ts">
  import { descriptionBalance, inclinaisonBalance } from "$lib/balance";

  let { poidsMoi, poidsAutre }: { poidsMoi: number; poidsAutre: number } =
    $props();

  const inclinaison = $derived(inclinaisonBalance(poidsMoi, poidsAutre));
  // Le côté le plus chargé descend : en SVG, une rotation négative fait descendre la gauche.
  const rotation = $derived(-inclinaison);
</script>

<figure class="balance">
  <svg viewBox="0 0 200 110" aria-hidden="true">
    <path d="M100 28 86 96h28z" fill="var(--texte)" opacity="0.85" />
    <rect x="70" y="94" width="60" height="8" rx="4" fill="var(--texte)" />
    <g class="fleau" style:transform={`rotate(${rotation}deg)`}>
      <rect x="22" y="24" width="156" height="7" rx="3.5" fill="var(--texte)" />
      <g class="plateau" style:transform={`rotate(${-rotation}deg)`}>
        <path
          d="M30 31 16 62M30 31l14 31"
          stroke="var(--texte-doux)"
          stroke-width="2"
        />
        <path d="M8 62h44a22 10 0 0 1-44 0z" fill="#ffd9c7" />
        <text x="30" y="84" text-anchor="middle">Moi</text>
      </g>
      <g class="plateau droite" style:transform={`rotate(${-rotation}deg)`}>
        <path
          d="M170 31 156 62M170 31l14 31"
          stroke="var(--texte-doux)"
          stroke-width="2"
        />
        <path d="M148 62h44a22 10 0 0 1-44 0z" fill="#d6ecff" />
        <text x="170" y="84" text-anchor="middle">L'autre</text>
      </g>
    </g>
    <circle cx="100" cy="27" r="6" fill="var(--texte)" />
  </svg>
  <figcaption>{descriptionBalance(inclinaison)}</figcaption>
</figure>

<style>
  .balance {
    margin: 0;
    padding: 12px 16px 14px;
    border-radius: var(--rayon);
    background: var(--surface);
    box-shadow: var(--carte-ombre);
    text-align: center;
  }

  svg {
    display: block;
    width: 100%;
    max-width: 280px;
    margin: 0 auto;
    overflow: visible;
  }

  .fleau {
    transform-origin: 100px 27px;
    transition: transform 0.8s cubic-bezier(0.3, 1.5, 0.6, 1);
  }

  .plateau {
    transform-origin: 30px 31px;
    transition: transform 0.8s cubic-bezier(0.3, 1.5, 0.6, 1);
  }

  .plateau.droite {
    transform-origin: 170px 31px;
  }

  text {
    fill: var(--texte);
    font-size: 12px;
    font-weight: 800;
  }

  figcaption {
    margin-top: 4px;
    font-weight: 700;
  }

  @media (prefers-reduced-motion: reduce) {
    .fleau,
    .plateau {
      transition: none;
    }
  }
</style>
