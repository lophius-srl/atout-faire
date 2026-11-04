<script lang="ts">
  import { notifications } from "$lib/notifications.svelte";
  import { fly } from "svelte/transition";
</script>

<div class="notifications" role="status" aria-live="polite">
  {#each notifications as notification (notification.id)}
    <p
      class="notification"
      class:erreur={notification.type === "erreur"}
      transition:fly={{ y: 24, duration: 200 }}
    >
      {notification.texte}
    </p>
  {/each}
</div>

<style>
  .notifications {
    position: fixed;
    inset: auto 16px calc(84px + env(safe-area-inset-bottom));
    z-index: 10;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    pointer-events: none;
  }

  .notification {
    max-width: 420px;
    margin: 0;
    padding: 12px 18px;
    border-radius: 999px;
    background: var(--texte);
    color: var(--fond);
    font-weight: 700;
    text-align: center;
    box-shadow: 0 8px 24px rgb(60 40 30 / 25%);
  }

  .erreur {
    background: #a4482a;
  }
</style>
