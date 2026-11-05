import { invalidate } from "$app/navigation";
import type { SubmitFunction } from "@sveltejs/kit";
import { afficherMessage } from "./notifications.svelte";
import type { ActionOptimiste } from "./optimiste";
import {
  attendreConfirmation,
  commencerAction,
  oublierAction,
} from "./optimiste.svelte";
import { messageApresAction } from "./retour";

/**
 * À passer à `use:enhance` : pendant l'envoi, le formulaire est marqué occupé
 * (boutons grisés, indicateur sur le bouton touché, pas de double envoi),
 * puis un message bref confirme le succès ou explique l'erreur.
 * `erreursDansLaPage` : la page affiche déjà ses erreurs à côté des champs, on ne les répète pas.
 * `recharger` : clé de dépendance à recharger après l'action (ex. les cartes), plutôt que
 * de recharger toute la page — le foyer et la distribution des cartes n'ont pas à être relus.
 * `optimiste` : la carte bouge tout de suite, sans attendre le serveur ; elle revient à sa place
 * si l'action échoue. Un second toucher sur la même carte est ignoré tant que la réponse n'est pas là.
 * La page appelle `oublierConfirmees` quand ses données changent.
 * `surEnvoi` : appelé au moment de l'envoi (ex. refermer les actions de la carte).
 */
export function avecRetour(
  messageSucces?: string,
  {
    erreursDansLaPage = false,
    recharger,
    optimiste,
    surEnvoi,
  }: {
    erreursDansLaPage?: boolean;
    recharger?: string;
    optimiste?: { carte: string; action: ActionOptimiste };
    surEnvoi?: () => void;
  } = {},
): SubmitFunction {
  return ({ formElement, submitter, cancel }) => {
    surEnvoi?.();
    if (optimiste && !commencerAction(optimiste.carte, optimiste.action)) {
      cancel();
      return;
    }
    formElement.setAttribute("aria-busy", "true");
    submitter?.setAttribute("data-envoi", "");
    return async ({ result, update }) => {
      formElement.removeAttribute("aria-busy");
      submitter?.removeAttribute("data-envoi");
      const message = messageApresAction(result, messageSucces);
      if (message && !(erreursDansLaPage && message.type === "erreur")) {
        afficherMessage(message);
      }
      if (optimiste) {
        // En cas d'échec, la carte revient tout de suite à sa place.
        if (message?.type === "erreur") {
          oublierAction(optimiste.carte, optimiste.action);
        } else {
          attendreConfirmation(optimiste.carte, optimiste.action);
        }
      }
      if (recharger) {
        await update({ invalidateAll: false });
        await invalidate(recharger);
      } else {
        await update();
      }
    };
  };
}
