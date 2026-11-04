import type { Carte } from "./cartes";

/** Une carte posée sur le Marché, en attente de preneur. */
export interface CarteAuMarche {
  carte: Carte;
  /** Vrai quand la carte traîne depuis longtemps et doit ressortir. */
  enAttente: boolean;
}

export interface Marche {
  duJour: CarteAuMarche[];
  deLaSemaine: CarteAuMarche[];
}

/** Les cartes en attente passent devant ; les autres gardent leur ordre. */
function attenteDAbord(cartes: CarteAuMarche[]): CarteAuMarche[] {
  return [
    ...cartes.filter((c) => c.enAttente),
    ...cartes.filter((c) => !c.enAttente),
  ];
}

export function organiserMarche(cartes: readonly CarteAuMarche[]): Marche {
  const duJour = cartes.filter((c) => c.carte.echeance.type === "jour");
  const deLaSemaine = cartes.filter((c) => c.carte.echeance.type === "semaine");
  return {
    duJour: attenteDAbord(duJour),
    deLaSemaine: attenteDAbord(deLaSemaine),
  };
}
