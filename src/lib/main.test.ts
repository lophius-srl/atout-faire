import { describe, expect, it } from "vitest";
import type { Carte } from "./cartes";
import { separerMain } from "./main";

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
