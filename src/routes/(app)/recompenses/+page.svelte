<script lang="ts">
  import { enhance } from "$app/forms";
  import { avecRetour } from "$lib/formulaire";
  import { DESCRIPTION_MAX } from "$lib/recompenses";
  import { DEPENDANCE_CARTES } from "$lib/temps-reel";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();

  const ETATS = {
    a_accepter: "L'autre te la propose",
    attend_accord: "En attente de son accord",
    acceptee: "D'accord à deux 🤝",
    debloquee: "Débloquée ! 🎁",
    profitee: "Vécue ✓",
  } as const;

  const recharger = { recharger: DEPENDANCE_CARTES };
</script>

<svelte:head>
  <title>Nos récompenses · Atout faire</title>
</svelte:head>

<h1>Nos récompenses</h1>
<p class="aide">
  Choisissez ensemble ce que vous vous offrirez en battant un boss. Vous en êtes
  au niveau
  {data.bossEnCours}.
</p>

<form
  method="POST"
  action="?/proposer"
  class="proposer"
  use:enhance={avecRetour("Récompense proposée 🎁", recharger)}
>
  <label for="niveau">Sur quel boss ?</label>
  <select id="niveau" name="niveau">
    {#each data.disponibles as { niveau, boss } (niveau)}
      <option value={niveau}>Niveau {niveau} · {boss}</option>
    {/each}
  </select>
  <label for="description">Quelle récompense ?</label>
  <input
    id="description"
    name="description"
    maxlength={DESCRIPTION_MAX}
    placeholder="Resto, ciné, grasse matinée…"
    required
  />
  <button type="submit" class="bouton-principal">Proposer</button>
</form>

{#if data.recompenses.length > 0}
  <ul class="liste">
    {#each data.recompenses as r (r.id)}
      <li class={`recompense ${r.statut}`}>
        <span class="boss">Niveau {r.niveau} · {r.boss}</span>
        <strong>🎁 {r.description}</strong>
        <span class="etat">{ETATS[r.statut]}</span>
        <div class="boutons">
          {#if r.statut === "a_accepter"}
            <form
              method="POST"
              action="?/accepter"
              use:enhance={avecRetour("D'accord ! 🤝", recharger)}
            >
              <input type="hidden" name="recompense" value={r.id} />
              <button type="submit" class="bouton-principal">D'accord 🤝</button
              >
            </form>
          {:else if r.statut === "debloquee"}
            <form
              method="POST"
              action="?/profiter"
              use:enhance={avecRetour("Bon moment ! ✨", recharger)}
            >
              <input type="hidden" name="recompense" value={r.id} />
              <button type="submit" class="bouton-principal"
                >C'est fait !</button
              >
            </form>
          {/if}
          {#if r.statut !== "profitee"}
            <form
              method="POST"
              action="?/retirer"
              use:enhance={avecRetour("Récompense retirée", recharger)}
            >
              <input type="hidden" name="recompense" value={r.id} />
              <button type="submit" class="secondaire">Retirer</button>
            </form>
          {/if}
        </div>
      </li>
    {/each}
  </ul>
{/if}

<style>
  h1 {
    margin: 0;
    font-size: 1.8rem;
  }

  .aide {
    color: var(--texte-doux);
  }

  .proposer {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 14px;
    border-radius: var(--rayon);
    background: #fff;
    box-shadow: var(--carte-ombre);
  }

  label {
    font-weight: 700;
  }

  select,
  input {
    min-height: 48px;
    padding: 0 12px;
    border: 2px solid #e8ddd5;
    border-radius: 14px;
    background: #fff;
    font: inherit;
  }

  .liste {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin: 20px 0 0;
    padding: 0;
    list-style: none;
  }

  .recompense {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 14px;
    border-radius: 14px;
    background: #fff1c2;
    color: #6b4e0f;
  }

  .recompense.a_accepter {
    box-shadow: 0 0 0 3px #f6b26b;
  }

  .recompense.debloquee {
    background: #dcf5d9;
    color: #2f6b2a;
  }

  .recompense.profitee {
    background: #f0ebe6;
    color: var(--texte-doux);
  }

  .boss {
    font-size: 0.8rem;
    font-weight: 700;
  }

  strong {
    font-size: 1.1rem;
  }

  .etat {
    font-size: 0.85rem;
    font-weight: 700;
  }

  .boutons {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    margin-top: 6px;
  }

  .boutons .bouton-principal {
    padding: 0 18px;
  }

  .secondaire {
    min-height: 44px;
    border: none;
    background: none;
    color: inherit;
    font: inherit;
    font-weight: 700;
    text-decoration: underline;
  }
</style>
