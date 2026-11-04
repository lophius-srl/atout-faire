<script lang="ts">
  import { CATEGORIES } from "$lib/categories";
</script>

<main>
  <h1>Atout faire</h1>
  <p class="sous-titre">Les tâches de la maison, à piocher et à retourner.</p>

  <ul class="main">
    {#each CATEGORIES as categorie (categorie.id)}
      <li
        class="carte"
        style:background={categorie.couleur}
        style:color={categorie.encre}
      >
        {categorie.nom}
      </li>
    {/each}
  </ul>
</main>

<style>
  main {
    max-width: 480px;
    margin: 0 auto;
    padding-top: 32px;
  }

  h1 {
    margin: 0;
    font-size: 2rem;
  }

  .sous-titre {
    margin: 4px 0 24px;
    color: var(--texte-doux);
  }

  .main {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    padding: 0;
    list-style: none;
  }

  .carte {
    display: flex;
    align-items: flex-end;
    aspect-ratio: 5 / 7;
    padding: 10px;
    border-radius: var(--rayon);
    box-shadow: var(--carte-ombre);
    font-weight: 700;
  }
</style>
