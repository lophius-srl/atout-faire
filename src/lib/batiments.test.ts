import { describe, expect, it } from "vitest";
import { BATIMENTS, batimentDeLaSemaine, fenetresAllumees } from "./batiments";
import { ajouterJours } from "./distribution";

describe("bâtiment de la semaine", () => {
  it("change chaque semaine et suit l'ordre des niveaux", () => {
    const lundi = "2026-11-02";
    const suite = [0, 1, 2, 3, 4, 5].map(
      (n) => batimentDeLaSemaine(ajouterJours(lundi, 7 * n)).id,
    );
    const depart = BATIMENTS.findIndex((b) => b.id === suite[0]);
    suite.forEach((id, n) =>
      expect(id).toBe(BATIMENTS[(depart + n) % BATIMENTS.length].id),
    );
    expect(suite[5]).toBe(suite[0]);
  });

  it("commence par la cabane la semaine de référence", () => {
    expect(batimentDeLaSemaine("2026-01-05").id).toBe("cabane");
  });

  it("fonctionne aussi avant la semaine de référence", () => {
    expect(batimentDeLaSemaine("2025-12-29").id).toBe("chateau");
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
