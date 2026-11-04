<script lang="ts">
  import { resolve } from "$app/paths";
  import { page } from "$app/state";

  const liens = [
    { href: resolve("/marche"), libelle: "Marché", icone: "🃏" },
    { href: resolve("/ma-main"), libelle: "Ma main", icone: "✋" },
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
      <span class="icone" aria-hidden="true">{lien.icone}</span>
      {lien.libelle}
    </a>
  {/each}
</nav>

<style>
  .navigation {
    position: fixed;
    inset: auto 0 0;
    display: flex;
    justify-content: center;
    gap: 8px;
    padding: 8px 16px calc(8px + env(safe-area-inset-bottom));
    background: rgb(255 248 240 / 92%);
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
    background: #fff;
    color: var(--texte);
    box-shadow: var(--carte-ombre);
  }

  .icone {
    font-size: 1.3rem;
  }
</style>
