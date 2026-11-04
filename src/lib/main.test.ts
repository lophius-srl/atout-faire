import { describe, expect, it } from "vitest";
import type { Carte } from "./cartes";
import { poidsDesMains, separerMain } from "./main";

function carte(id: string, retournee: boolean): Carte {
  return {
    id,
    tache: id,
    categorie: "cuisine",
    echeance: { type: "semaine" },
    retournee,
  };
}

describe("ma main", () => {
  it("sépare les cartes à faire et les cartes retournées, dans l'ordre", () => {
    const main = separerMain([
      carte("a", false),
      carte("b", true),
      carte("c", false),
      carte("d", true),
    ]);
    expect(main.aFaire.map((c) => c.id)).toEqual(["a", "c"]);
    expect(main.retournees.map((c) => c.id)).toEqual(["b", "d"]);
  });

  it("gère une main vide", () => {
    expect(separerMain([])).toEqual({ aFaire: [], retournees: [] });
  });
});

describe("poids des mains", () => {
  it("additionne la pénibilité des cartes de chacun, sans compter le Marché", () => {
    const cartes = [
      { detenteur: "moi", penibilite: 2 },
      { detenteur: "moi", penibilite: 3 },
      { detenteur: "autre", penibilite: 1 },
      { detenteur: null, penibilite: 3 },
    ];
    expect(poidsDesMains(cartes, "moi")).toEqual({ moi: 5, autre: 1 });
  });
});
