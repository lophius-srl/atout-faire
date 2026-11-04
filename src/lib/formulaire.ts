import type { SubmitFunction } from "@sveltejs/kit";
import { afficherMessage } from "./notifications.svelte";
import { messageApresAction } from "./retour";

/**
 * À passer à `use:enhance` : pendant l'envoi, le formulaire est marqué occupé
 * (boutons grisés, indicateur sur le bouton touché, pas de double envoi),
 * puis un message bref confirme le succès ou explique l'erreur.
 * `erreursDansLaPage` : la page affiche déjà ses erreurs à côté des champs, on ne les répète pas.
 */
export function avecRetour(
  messageSucces?: string,
  { erreursDansLaPage = false } = {},
): SubmitFunction {
  return ({ formElement, submitter }) => {
    formElement.setAttribute("aria-busy", "true");
    submitter?.setAttribute("data-envoi", "");
    return async ({ result, update }) => {
      formElement.removeAttribute("aria-busy");
      submitter?.removeAttribute("data-envoi");
      const message = messageApresAction(result, messageSucces);
      if (message && !(erreursDansLaPage && message.type === "erreur")) {
        afficherMessage(message);
      }
      await update();
    };
  };
}
