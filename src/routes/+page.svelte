<script lang="ts">
  import { resolve } from "$app/paths";
  import type { Carte } from "$lib/cartes";
  import CarteTache from "$lib/components/Carte.svelte";

  const exemples: Carte[] = [
    {
      id: "1",
      tache: "Repas",
      categorie: "cuisine",
      echeance: { type: "jour", jour: "mardi" },
      retournee: false,
    },
    {
      id: "2",
      tache: "Bain",
      categorie: "enfants",
      echeance: { type: "jour", jour: "mardi" },
      retournee: false,
    },
    {
      id: "3",
      tache: "Courses",
      categorie: "courses",
      echeance: { type: "semaine" },
      retournee: true,
    },
  ];

  const etapes = [
    {
      titre: "Vos tâches deviennent des cartes",
      texte: "Chaque jour, les cartes arrivent toutes seules sur le Marché.",
    },
    {
      titre: "Chacun pioche quand il veut",
      texte: "On prend, on échange, on retourne la carte quand c'est fait.",
    },
    {
      titre: "La balance garde l'équilibre",
      texte:
        "Elle tient compte de ce qui est pénible et de ce que chacun aime.",
    },
  ];
</script>

<svelte:head>
  <title>Atout faire · Les tâches de la maison, à deux</title>
</svelte:head>

<main>
  <h1>Atout faire</h1>
  <p class="accroche">
    Les tâches de la maison, à piocher comme des cartes. Pour deux, sans points
    ni classement.
  </p>

  <div class="eventail" aria-hidden="true">
    {#each exemples as carte, rang (carte.id)}
      <div class="carte" style:--rang={rang - 1}>
        <CarteTache {carte} />
      </div>
    {/each}
  </div>

  <ol class="etapes">
    {#each etapes as etape (etape.titre)}
      <li>
        <strong>{etape.titre}</strong>
        <span>{etape.texte}</span>
      </li>
    {/each}
  </ol>

  <a class="bouton-principal" href={resolve("/connexion")}>Commencer</a>
  <p class="deja">Déjà un compte ? Le même bouton te reconnecte.</p>
</main>

<style>
  main {
    max-width: 420px;
    margin: 0 auto;
    padding: 40px 0 32px;
  }

  h1 {
    margin: 0;
    font-size: 2.2rem;
  }

  .accroche {
    margin: 6px 0 0;
    color: var(--texte-doux);
    font-size: 1.05rem;
  }

  .eventail {
    position: relative;
    height: 175px;
    margin: 28px 0 8px;
  }

  .carte {
    position: absolute;
    top: 0;
    left: 50%;
    width: 100px;
    transform: translateX(calc(-50% + var(--rang) * 62px))
      rotate(calc(var(--rang) * 9deg));
    transform-origin: 50% 120%;
  }

  .etapes {
    display: flex;
    flex-direction: column;
    gap: 14px;
    margin: 24px 0 28px;
    padding-left: 22px;
  }

  .etapes li::marker {
    font-weight: 800;
  }

  .etapes strong,
  .etapes span {
    display: block;
  }

  .etapes span {
    color: var(--texte-doux);
  }

  .deja {
    margin-top: 10px;
    color: var(--texte-doux);
    font-size: 0.9rem;
    text-align: center;
  }
</style>
