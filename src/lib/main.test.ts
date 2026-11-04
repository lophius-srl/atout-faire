import { describe, expect, it } from "vitest";
import type { Carte } from "./cartes";
import { poidsCarte, poidsDesMains, semaineFinie, separerMain } from "./main";

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

describe("poids d'une carte", () => {
  it("vaut 1 pour une tâche moyenne que j'aime bien", () => {
    expect(poidsCarte(2, "aime")).toBe(1);
  });

  it("vaut 3 pour la même tâche quand on ne l'aime pas", () => {
    expect(poidsCarte(2, "naime_pas")).toBe(3);
  });

  it("vaut la pénibilité quand on est neutre", () => {
    expect(poidsCarte(3, "neutre")).toBe(3);
  });
});

describe("poids des mains", () => {
  it("additionne pénibilité × goût des cartes de chacun", () => {
    const cartes = [
      { detenteur: "moi", penibilite: 2, gout: "aime" },
      { detenteur: "moi", penibilite: 3, gout: "neutre" },
      { detenteur: "autre", penibilite: 2, gout: "naime_pas" },
    ] as const;
    expect(poidsDesMains(cartes, "moi")).toEqual({ moi: 4, autre: 3 });
  });

  it("ne compte pas les cartes du Marché, ni une carte remise au Marché", () => {
    const cartes = [
      { detenteur: "moi", penibilite: 2, gout: "neutre" },
      { detenteur: null, penibilite: 3, gout: "neutre" },
    ] as const;
    expect(poidsDesMains(cartes, "moi")).toEqual({ moi: 2, autre: 0 });
  });

  it("est équilibré quand chacun porte le même effort ressenti", () => {
    const cartes = [
      { detenteur: "moi", penibilite: 2, gout: "naime_pas" },
      { detenteur: "autre", penibilite: 3, gout: "neutre" },
    ] as const;
    const poids = poidsDesMains(cartes, "moi");
    expect(poids.moi).toBe(poids.autre);
  });
});

describe("semaine finie", () => {
  it("est finie quand toutes les cartes sont retournées", () => {
    expect(semaineFinie([{ retournee: true }, { retournee: true }])).toBe(true);
  });

  it("n'est pas finie tant qu'une carte reste à faire", () => {
    expect(semaineFinie([{ retournee: true }, { retournee: false }])).toBe(
      false,
    );
  });

  it("n'est pas finie quand il n'y a encore aucune carte", () => {
    expect(semaineFinie([])).toBe(false);
  });
});
