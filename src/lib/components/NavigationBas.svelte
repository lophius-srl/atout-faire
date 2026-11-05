<script lang="ts">
  import { resolve } from "$app/paths";
  import { page } from "$app/state";
  import { arriveesDansLaMain } from "$lib/rebond.svelte";

  const liens = [
    { href: resolve("/marche"), libelle: "Marché", icone: "🃏" },
    { href: resolve("/ma-main"), libelle: "Ma main", icone: "✋" },
    { href: resolve("/souvenirs"), libelle: "Souvenirs", icone: "🏆" },
  ];
</script>

<nav class="navigation" aria-label="Navigation principale">
  {#each liens as lien (lien.href)}
    <a
      href={lien.href}
      class="lien"
      aria-current={page.url.pathname.startsWith(lien.href)
        ? "page"
        : undefined}
    >
      {#if lien.libelle === "Ma main"}
        <!-- Rejoue le rebond à chaque carte arrivée. -->
        {#key arriveesDansLaMain.compte}
          <span
            class="icone"
            class:rebond={arriveesDansLaMain.compte > 0}
            aria-hidden="true">{lien.icone}</span
          >
        {/key}
      {:else}
        <span class="icone" aria-hidden="true">{lien.icone}</span>
      {/if}
      {lien.libelle}
    </a>
  {/each}
</nav>

<style>
  .rebond {
    animation: rebond 0.5s ease-out;
  }

  @keyframes rebond {
    30% {
      transform: translateY(-8px) scale(1.25);
    }
    60% {
      transform: translateY(0) scale(0.95);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .rebond {
      animation: none;
    }
  }

  .navigation {
    position: fixed;
    inset: auto 0 0;
    display: flex;
    justify-content: center;
    gap: 8px;
    padding: 8px 16px calc(8px + env(safe-area-inset-bottom));
    background: rgb(var(--voile) / 92%);
    backdrop-filter: blur(10px);
    box-shadow: 0 -4px 16px rgb(120 80 60 / 10%);
  }

  .lien {
    display: flex;
    flex: 1;
    max-width: 200px;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 52px;
    border-radius: 16px;
    color: var(--texte-doux);
    font-size: 0.85rem;
    font-weight: 700;
    text-decoration: none;
  }

  .lien[aria-current="page"] {
    background: var(--surface);
    color: var(--texte);
    box-shadow: var(--carte-ombre);
  }

  .icone {
    font-size: 1.3rem;
  }
</style>
