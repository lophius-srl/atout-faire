<script lang="ts">
  import { descriptionCarte, libelleEcheance, type Carte } from "$lib/cartes";
  import { trouverCategorie } from "$lib/categories";
  import IllustrationCategorie from "$lib/illustrations/IllustrationCategorie.svelte";

  let { carte }: { carte: Carte } = $props();

  const categorie = $derived(trouverCategorie(carte.categorie));
</script>

<article
  class="carte"
  class:retournee={carte.retournee}
  style:--couleur={categorie.couleur}
  style:--encre={categorie.encre}
>
  <span class="lecteur-ecran">{descriptionCarte(carte, categorie.nom)}</span>
  <div class="faces">
    <div class="face recto" aria-hidden="true">
      <span class="categorie">{categorie.nom}</span>
      <div class="scene">
        <IllustrationCategorie
          categorie={carte.categorie}
          encre={categorie.encre}
        />
      </div>
      <h3 class="tache">{carte.tache}</h3>
      <span class="echeance">{libelleEcheance(carte.echeance)}</span>
    </div>

    <div class="face verso" aria-hidden="true">
      <svg viewBox="0 0 40 40" class="coche">
        <circle cx="20" cy="20" r="18" fill="#fff" opacity="0.9" />
        <path
          d="M12 21l6 6 11-13"
          stroke="currentColor"
          stroke-width="4"
          stroke-linecap="round"
          stroke-linejoin="round"
          fill="none"
        />
      </svg>
      <span class="fait">Fait !</span>
      <span class="tache-verso">{carte.tache}</span>
    </div>
  </div>
</article>

<style>
  .carte {
    position: relative;
    aspect-ratio: 5 / 7;
    min-height: 44px;
    perspective: 900px;
  }

  .lecteur-ecran {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }

  .faces {
    position: relative;
    width: 100%;
    height: 100%;
    transform-style: preserve-3d;
    transition: transform 0.5s cubic-bezier(0.3, 1.4, 0.6, 1);
  }

  .retournee .faces {
    transform: rotateY(180deg);
  }

  .face {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    padding: 10px 12px 12px;
    border-radius: var(--rayon);
    box-shadow: var(--carte-ombre);
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    overflow: hidden;
  }

  .recto {
    background: var(--couleur);
    color: var(--encre);
    border: 3px solid #fff;
  }

  .categorie {
    align-self: flex-start;
    padding: 2px 8px;
    border-radius: 999px;
    background: #fff;
    font-size: 0.7rem;
    font-weight: 800;
    letter-spacing: 0.03em;
    text-transform: uppercase;
  }

  .scene {
    flex: 1;
    display: flex;
    align-items: center;
    padding: 4px 0;
  }

  .tache {
    margin: 0;
    font-size: 1.05rem;
    line-height: 1.15;
    font-weight: 800;
  }

  .echeance {
    margin-top: 2px;
    font-size: 0.8rem;
    font-weight: 600;
    opacity: 0.8;
  }

  .verso {
    align-items: center;
    justify-content: center;
    gap: 6px;
    transform: rotateY(180deg);
    color: var(--encre);
    border: 3px solid #fff;
    background:
      repeating-linear-gradient(
        45deg,
        rgb(255 255 255 / 18%) 0 8px,
        transparent 8px 16px
      ),
      var(--encre);
    text-align: center;
  }

  .coche {
    width: 46%;
  }

  .fait {
    color: #fff;
    font-size: 1.2rem;
    font-weight: 800;
  }

  .tache-verso {
    color: #fff;
    font-size: 0.8rem;
    font-weight: 600;
    opacity: 0.85;
  }

  @media (prefers-reduced-motion: reduce) {
    .faces {
      transition: none;
    }
  }
</style>
