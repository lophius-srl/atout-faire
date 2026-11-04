export type StatutEchange =
  "en_attente" | "contre_proposition" | "accepte" | "refuse" | "annule";

export type Reponse = "accepter" | "refuser" | "contre_proposer";

export interface Echange {
  id: string;
  proposePar: string;
  carteOfferte: string;
  carteContre: string | null;
  statut: StatutEchange;
}

export function estEnCours(statut: StatutEchange): boolean {
  return statut === "en_attente" || statut === "contre_proposition";
}

/**
 * Ce que je peux répondre à un échange (mêmes règles que la base) :
 * l'autre parent répond à une proposition ; celui qui a proposé répond à une contre-proposition.
 */
export function reponsesPossibles(echange: Echange, moi: string): Reponse[] {
  const jePropose = echange.proposePar === moi;
  if (echange.statut === "en_attente" && !jePropose) {
    return ["accepter", "contre_proposer", "refuser"];
  }
  if (echange.statut === "contre_proposition" && jePropose) {
    return ["accepter", "refuser"];
  }
  return [];
}

/** Une réponse qui m'oblige à choisir une carte de ma main. */
export function demandeUneCarte(reponse: Reponse, echange: Echange): boolean {
  return reponse !== "refuser" && echange.statut === "en_attente";
}

/** Une carte déjà engagée dans un échange en cours ne peut pas être proposée ailleurs. */
export function cartesEngagees(echanges: readonly Echange[]): Set<string> {
  const engagees = new Set<string>();
  for (const echange of echanges) {
    if (!estEnCours(echange.statut)) continue;
    engagees.add(echange.carteOfferte);
    if (echange.carteContre) engagees.add(echange.carteContre);
  }
  return engagees;
}

/** Phrase courte qui décrit où en est l'échange, de mon point de vue. */
export function situationEchange(echange: Echange, moi: string): string {
  const jePropose = echange.proposePar === moi;
  switch (echange.statut) {
    case "en_attente":
      return jePropose ? "En attente de sa réponse" : "Te propose un échange";
    case "contre_proposition":
      return jePropose
        ? "Te fait une contre-proposition"
        : "En attente de sa réponse";
    case "accepte":
      return "Échange fait";
    case "refuse":
      return jePropose ? "A refusé ton échange" : "Tu as refusé";
    case "annule":
      return "Annulé : une des cartes a bougé";
  }
}
