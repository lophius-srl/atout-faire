import { describe, expect, it } from "vitest";
import type { Carte } from "./cartes";
import { heureDansFuseau } from "./distribution";
import {
  niveauAttente,
  organiserMarche,
  type CarteAuMarche,
  type NiveauAttente,
} from "./marche";

function auMarche(
  id: string,
  echeance: Carte["echeance"],
  niveau: NiveauAttente = 0,
): CarteAuMarche {
  return {
    carte: { id, tache: id, categorie: "maison", echeance, retournee: false },
    niveau,
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

  it("fait remonter les cartes qui attendent le plus, sans changer l'ordre des autres", () => {
    const marche = organiserMarche([
      auMarche("a", mardi, 0),
      auMarche("b", mardi, 1),
      auMarche("c", mardi, 0),
      auMarche("d", mardi, 2),
      auMarche("e", mardi, 1),
    ]);
    expect(ids(marche.duJour)).toEqual(["d", "b", "e", "a", "c"]);
  });

  it("renvoie des sections vides pour un Marché vide", () => {
    expect(organiserMarche([])).toEqual({ duJour: [], deLaSemaine: [] });
  });
});

describe("niveau d'attente", () => {
  // Le 2026-11-03 est un mardi.
  const duMardi = { echeance: "jour", dateEcheance: "2026-11-03" } as const;
  const hebdo = { echeance: "semaine", dateEcheance: "2026-11-02" } as const;

  it("ressort une carte du jour au fil de la journée", () => {
    expect(niveauAttente(duMardi, { date: "2026-11-03", heure: 9 })).toBe(0);
    expect(niveauAttente(duMardi, { date: "2026-11-03", heure: 13 })).toBe(1);
    expect(niveauAttente(duMardi, { date: "2026-11-03", heure: 19 })).toBe(2);
  });

  it("met au plus haut une carte d'un jour déjà passé", () => {
    expect(niveauAttente(duMardi, { date: "2026-11-04", heure: 8 })).toBe(2);
  });

  it("ressort une carte hebdo au fil de la semaine", () => {
    expect(niveauAttente(hebdo, { date: "2026-11-04", heure: 20 })).toBe(0); // mercredi
    expect(niveauAttente(hebdo, { date: "2026-11-05", heure: 8 })).toBe(1); // jeudi
    expect(niveauAttente(hebdo, { date: "2026-11-07", heure: 8 })).toBe(2); // samedi
  });

  it("lit l'heure dans le fuseau du foyer", () => {
    // 11 h UTC = midi à Paris en hiver.
    expect(
      heureDansFuseau(new Date("2026-11-03T11:00:00Z"), "Europe/Paris"),
    ).toBe(12);
  });
});
