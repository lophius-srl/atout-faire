import { describe, expect, it } from "vitest";
import { trajetVersCible } from "./animations";

describe("trajet vers une cible", () => {
  it("va de centre à centre et rapetisse jusqu'à la taille de la cible", () => {
    const carte = { left: 20, top: 200, width: 160, height: 200 };
    const onglet = { left: 133, top: 740, width: 109, height: 52 };
    const { dx, dy, echelle } = trajetVersCible(carte, onglet);
    expect(dx).toBeCloseTo(87.5);
    expect(dy).toBeCloseTo(466);
    expect(echelle).toBeCloseTo(0.26);
  });

  it("ne grossit jamais et ne disparaît pas tout à fait", () => {
    const petit = { left: 0, top: 0, width: 10, height: 10 };
    const grand = { left: 0, top: 0, width: 400, height: 400 };
    expect(trajetVersCible(petit, grand).echelle).toBe(1);
    expect(trajetVersCible(grand, petit).echelle).toBe(0.1);
  });
});
