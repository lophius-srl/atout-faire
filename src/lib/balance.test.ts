import { describe, expect, it } from "vitest";
import {
  descriptionBalance,
  proposerCoupDeMain,
  INCLINAISON_MAX,
  inclinaisonBalance,
} from "./balance";

describe("inclinaison de la balance", () => {
  it("reste à l'horizontale quand les poids sont égaux", () => {
    expect(inclinaisonBalance(6, 6)).toBe(0);
  });

  it("reste à l'horizontale quand personne n'a rien pris", () => {
    expect(inclinaisonBalance(0, 0)).toBe(0);
  });

  it("penche de mon côté quand je porte plus", () => {
    expect(inclinaisonBalance(7, 5)).toBeGreaterThan(0);
  });

  it("penche du côté de l'autre quand il porte plus", () => {
    expect(inclinaisonBalance(5, 7)).toBeLessThan(0);
  });

  it("penche d'autant plus que l'écart est grand", () => {
    expect(inclinaisonBalance(8, 4)).toBeGreaterThan(inclinaisonBalance(7, 5));
  });

  it("est plafonnée", () => {
    expect(inclinaisonBalance(10, 0)).toBe(INCLINAISON_MAX);
    expect(inclinaisonBalance(0, 10)).toBe(-INCLINAISON_MAX);
  });
});

describe("description de la balance", () => {
  it("décrit une balance équilibrée", () => {
    expect(descriptionBalance(0)).toBe("La balance est équilibrée.");
  });

  it("dit qui porte plus, avec des mots", () => {
    expect(descriptionBalance(5)).toBe("Tu en portes un peu plus.");
    expect(descriptionBalance(-INCLINAISON_MAX)).toBe(
      "L'autre en porte beaucoup plus.",
    );
  });

  it("ne contient jamais de chiffre", () => {
    for (const inclinaison of [-14, -9, -3, 0, 3, 9, 14]) {
      expect(descriptionBalance(inclinaison)).not.toMatch(/\d/);
    }
  });
});

describe("coup de main", () => {
  it("est proposé quand l'autre en porte beaucoup plus et qu'il reste des cartes", () => {
    expect(proposerCoupDeMain(2, 8, 3)).toBe(true);
  });

  it("n'est pas proposé quand l'écart est faible", () => {
    expect(proposerCoupDeMain(5, 6, 3)).toBe(false);
  });

  it("n'est pas proposé quand c'est moi qui en porte plus", () => {
    expect(proposerCoupDeMain(8, 2, 3)).toBe(false);
  });

  it("n'est pas proposé quand le Marché est vide", () => {
    expect(proposerCoupDeMain(0, 10, 0)).toBe(false);
  });
});
