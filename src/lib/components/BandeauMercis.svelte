<script lang="ts">
  import { enhance } from "$app/forms";
  import { avecRetour } from "$lib/formulaire";
  import { DEPENDANCE_CARTES } from "$lib/temps-reel";

  let { message }: { message: string } = $props();
</script>

<form
  method="POST"
  action="?/mercisVus"
  class="bandeau"
  use:enhance={avecRetour(undefined, { recharger: DEPENDANCE_CARTES })}
>
  <p role="status">{message}</p>
  <button type="submit">Ça fait plaisir</button>
</form>

<style>
  .bandeau {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin: 8px 0 12px;
    padding: 14px;
    border-radius: 14px;
    background: var(--rose-fond);
    color: var(--rose-texte);
  }

  p {
    margin: 0;
    font-weight: 800;
  }

  button {
    align-self: flex-start;
    min-height: 44px;
    padding: 0 16px;
    border: none;
    border-radius: 999px;
    background: #a33a72;
    color: #fff;
    font: inherit;
    font-weight: 700;
  }
</style>
