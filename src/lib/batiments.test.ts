import { describe, expect, it } from "vitest";
import { BATIMENTS, batimentDuNiveau, fenetresAllumees } from "./batiments";

describe("bâtiment du niveau", () => {
  it("commence par la cabane et monte d'un bâtiment par semaine vaincue", () => {
    expect([0, 1, 2, 3, 4].map((n) => batimentDuNiveau(n).id)).toEqual(
      BATIMENTS.map((b) => b.id),
    );
  });

  it("repart de la cabane après le château", () => {
    expect(batimentDuNiveau(5).id).toBe("cabane");
    expect(batimentDuNiveau(9).id).toBe("chateau");
  });

  it("a des bâtiments de plus en plus grands", () => {
    const tailles = BATIMENTS.map((b) => b.fenetres.length);
    expect([...tailles].sort((a, b) => a - b)).toEqual(tailles);
  });
});

describe("fenêtres allumées", () => {
  it("n'allume rien tant qu'aucune carte n'est retournée", () => {
    expect(fenetresAllumees(0, 10, 5)).toBe(0);
    expect(fenetresAllumees(0, 0, 5)).toBe(0);
  });

  it("allume en proportion des cartes retournées", () => {
    expect(fenetresAllumees(5, 10, 6)).toBe(3);
  });

  it("garde la dernière fenêtre pour la fin de la semaine", () => {
    expect(fenetresAllumees(9, 10, 5)).toBe(4);
    expect(fenetresAllumees(10, 10, 5)).toBe(5);
  });
});
