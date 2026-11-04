import type { Message } from "./retour";

const DUREE_AFFICHAGE_MS = 2600;

let prochainId = 0;

/** Messages brefs affichés en bas de l'écran. */
export const notifications = $state<(Message & { id: number })[]>([]);

export function afficherMessage(message: Message): void {
  const id = ++prochainId;
  notifications.push({ ...message, id });
  setTimeout(() => {
    const index = notifications.findIndex((n) => n.id === id);
    if (index >= 0) notifications.splice(index, 1);
  }, DUREE_AFFICHAGE_MS);
}
