import { describe, expect, it } from "vitest";
import type { Carte } from "./cartes";
import { organiserMarche, type CarteAuMarche } from "./marche";

function auMarche(
  id: string,
  echeance: Carte["echeance"],
  enAttente = false,
): CarteAuMarche {
  return {
    carte: { id, tache: id, categorie: "maison", echeance, retournee: false },
    enAttente,
  };
}

const mardi = { type: "jour", jour: "mardi" } as const;
const semaine = { type: "semaine" } as const;

const ids = (cartes: CarteAuMarche[]) => cartes.map((c) => c.carte.id);

describe("organisation du Marché", () => {
  it("sépare les cartes du jour et celles de la semaine", () => {
    const marche = organiserMarche([
      auMarche("vaisselle", mardi),
      auMarche("aspirateur", semaine),
      auMarche("linge", mardi),
    ]);
    expect(ids(marche.duJour)).toEqual(["vaisselle", "linge"]);
    expect(ids(marche.deLaSemaine)).toEqual(["aspirateur"]);
  });

  it("met les cartes en attente en tête, sans changer l'ordre des autres", () => {
    const marche = organiserMarche([
      auMarche("a", mardi),
      auMarche("b", mardi, true),
      auMarche("c", mardi),
      auMarche("d", mardi, true),
    ]);
    expect(ids(marche.duJour)).toEqual(["b", "d", "a", "c"]);
  });

  it("renvoie des sections vides pour un Marché vide", () => {
    expect(organiserMarche([])).toEqual({ duJour: [], deLaSemaine: [] });
  });
});
