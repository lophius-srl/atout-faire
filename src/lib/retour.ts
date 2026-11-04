import type { ActionResult } from "@sveltejs/kit";

export type TypeMessage = "succes" | "erreur";

export interface Message {
  texte: string;
  type: TypeMessage;
}

const ERREUR_PAR_DEFAUT = "Ça n'a pas marché. Réessaie dans un instant.";

/** Le message à montrer après une action, ou null s'il n'y a rien à dire. */
export function messageApresAction(
  resultat: ActionResult,
  messageSucces?: string,
): Message | null {
  if (resultat.type === "failure") {
    const erreur = resultat.data?.erreur;
    return {
      texte: typeof erreur === "string" ? erreur : ERREUR_PAR_DEFAUT,
      type: "erreur",
    };
  }
  if (resultat.type === "error") {
    return { texte: ERREUR_PAR_DEFAUT, type: "erreur" };
  }
  return messageSucces ? { texte: messageSucces, type: "succes" } : null;
}
