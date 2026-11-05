import { untrack } from "svelte";
import { SvelteMap } from "svelte/reactivity";
import type { Carte } from "./cartes";
import {
  actionsConfirmees,
  type ActionOptimiste,
  type Liste,
} from "./optimiste";

/**
 * Actions sur les cartes envoyées au serveur et pas encore visibles dans ses données,
 * partagées par les pages. Modifiée seulement dans le navigateur (jamais pendant le rendu serveur).
 */
export const actionsEnAttente = new SvelteMap<string, ActionOptimiste>();

/** Au-delà, on cesse de simuler l'action même si les données fraîches ne sont pas venues. */
export const DELAI_SECOURS_MS = 10_000;

/** Commence à simuler l'action. Faux si la carte attend déjà une réponse (second toucher). */
export function commencerAction(
  carte: string,
  action: ActionOptimiste,
): boolean {
  if (actionsEnAttente.has(carte)) return false;
  actionsEnAttente.set(carte, action);
  return true;
}

/** Cesse de simuler l'action : la carte reprend l'état donné par le serveur. */
export function oublierAction(carte: string, action: ActionOptimiste): void {
  if (actionsEnAttente.get(carte) === action) actionsEnAttente.delete(carte);
}

/** Le serveur a accepté : on garde l'action jusqu'aux données fraîches, avec un délai de secours. */
export function attendreConfirmation(
  carte: string,
  action: ActionOptimiste,
): void {
  setTimeout(() => oublierAction(carte, action), DELAI_SECOURS_MS);
}

/** À appeler quand les données d'une liste changent : oublie les actions qu'elles montrent déjà. */
export function oublierConfirmees(
  cartes: readonly Carte[],
  liste: Liste,
): void {
  untrack(() => {
    for (const id of actionsConfirmees(actionsEnAttente, cartes, liste)) {
      actionsEnAttente.delete(id);
    }
  });
}
