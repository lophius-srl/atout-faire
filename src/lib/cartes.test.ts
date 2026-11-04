import { describe, expect, it } from "vitest";
import { descriptionCarte, libelleEcheance, type Carte } from "./cartes";

const vaisselle: Carte = {
  id: "vaisselle-mardi",
  tache: "Vaisselle",
  categorie: "cuisine",
  echeance: { type: "jour", jour: "mardi" },
  retournee: false,
};

describe("libellé de l'échéance", () => {
  it("affiche le jour avec une majuscule", () => {
    expect(libelleEcheance({ type: "jour", jour: "mardi" })).toBe("Mardi");
  });

  it("affiche « Cette semaine » pour une carte hebdo", () => {
    expect(libelleEcheance({ type: "semaine" })).toBe("Cette semaine");
  });
});

describe("description de la carte", () => {
  it("décrit une carte à faire", () => {
    expect(descriptionCarte(vaisselle, "Cuisine")).toBe(
      "Vaisselle, Cuisine, mardi, à faire",
    );
  });

  it("décrit une carte retournée comme faite", () => {
    const faite = { ...vaisselle, retournee: true };
    expect(descriptionCarte(faite, "Cuisine")).toBe(
      "Vaisselle, Cuisine, mardi, faite",
    );
  });
});
