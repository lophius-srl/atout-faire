<script lang="ts">
  import type { CategorieId } from "$lib/categories";

  let { categorie, encre }: { categorie: CategorieId; encre: string } =
    $props();
</script>

<!-- Petites scènes douces, une par catégorie. Décoratives : le texte de la carte porte le sens. -->
<svg viewBox="0 0 100 70" aria-hidden="true" class="illustration">
  <ellipse cx="50" cy="62" rx="38" ry="5" fill={encre} opacity="0.12" />

  {#if categorie === "cuisine"}
    <path
      d="M38 14c-3 4 3 6 0 10M50 10c-3 4 3 6 0 10M62 14c-3 4 3 6 0 10"
      stroke={encre}
      stroke-width="2.5"
      stroke-linecap="round"
      fill="none"
      opacity="0.45"
    />
    <rect x="26" y="30" width="48" height="28" rx="10" fill="#fff" />
    <rect x="22" y="28" width="56" height="7" rx="3.5" fill={encre} />
    <rect x="14" y="38" width="12" height="5" rx="2.5" fill={encre} />
    <rect x="74" y="38" width="12" height="5" rx="2.5" fill={encre} />
    <circle cx="42" cy="46" r="2" fill={encre} />
    <circle cx="58" cy="46" r="2" fill={encre} />
    <path
      d="M45 51q5 4 10 0"
      stroke={encre}
      stroke-width="2"
      stroke-linecap="round"
      fill="none"
    />
  {:else if categorie === "maison"}
    <path d="M24 34 50 12l26 22z" fill={encre} />
    <rect x="30" y="32" width="40" height="28" rx="4" fill="#fff" />
    <rect x="45" y="44" width="10" height="16" rx="3" fill={encre} />
    <path
      d="M38 41c-2-3-6 0-3 3l3 3 3-3c3-3-1-6-3-3z"
      fill={encre}
      opacity="0.6"
    />
    <circle cx="80" cy="20" r="2.5" fill={encre} opacity="0.4" />
    <circle cx="18" cy="26" r="2" fill={encre} opacity="0.4" />
  {:else if categorie === "enfants"}
    <circle cx="36" cy="28" r="7" fill={encre} opacity="0.8" />
    <circle cx="64" cy="28" r="7" fill={encre} opacity="0.8" />
    <circle cx="50" cy="38" r="18" fill="#fff" />
    <circle cx="44" cy="35" r="2" fill={encre} />
    <circle cx="56" cy="35" r="2" fill={encre} />
    <ellipse cx="50" cy="42" rx="5" ry="3.5" fill={encre} opacity="0.7" />
    <circle cx="40" cy="42" r="3" fill={encre} opacity="0.2" />
    <circle cx="60" cy="42" r="3" fill={encre} opacity="0.2" />
    <rect
      x="72"
      y="48"
      width="12"
      height="12"
      rx="3"
      fill={encre}
      opacity="0.5"
    />
    <circle cx="20" cy="54" r="6" fill={encre} opacity="0.35" />
  {:else if categorie === "admin"}
    <rect x="34" y="12" width="32" height="40" rx="4" fill="#fff" />
    <path
      d="M40 22h20M40 29h20M40 36h12"
      stroke={encre}
      stroke-width="2.5"
      stroke-linecap="round"
      opacity="0.5"
    />
    <rect x="24" y="34" width="52" height="26" rx="5" fill={encre} />
    <path
      d="M24 38l26 14 26-14"
      stroke="#fff"
      stroke-width="2.5"
      stroke-linejoin="round"
      fill="none"
      opacity="0.8"
    />
  {:else if categorie === "courses"}
    <circle cx="40" cy="22" r="8" fill={encre} opacity="0.55" />
    <path
      d="M56 26c0-10 8-14 12-12-1 6-6 11-12 12z"
      fill={encre}
      opacity="0.75"
    />
    <circle cx="54" cy="24" r="7" fill={encre} opacity="0.35" />
    <path d="M28 30h44l-4 30H32z" fill="#fff" />
    <path
      d="M40 30v-4a10 10 0 0 1 20 0v4"
      stroke={encre}
      stroke-width="3"
      stroke-linecap="round"
      fill="none"
    />
    <circle cx="50" cy="45" r="4" fill={encre} opacity="0.5" />
  {:else}
    <path
      d="M18 46c0-8 4-12 12-14l8-10h22c5 0 8 3 10 6l6 6c6 1 8 5 8 10v6H18z"
      fill="#fff"
    />
    <path d="M42 24h16l8 10H36z" fill={encre} opacity="0.35" />
    <circle cx="32" cy="54" r="7" fill={encre} />
    <circle cx="68" cy="54" r="7" fill={encre} />
    <circle cx="32" cy="54" r="2.5" fill="#fff" />
    <circle cx="68" cy="54" r="2.5" fill="#fff" />
    <circle cx="80" cy="44" r="2" fill={encre} opacity="0.7" />
  {/if}
</svg>

<style>
  .illustration {
    display: block;
    width: 100%;
    height: auto;
  }
</style>
