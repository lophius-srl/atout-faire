import { describe, expect, it } from "vitest";
import {
  BATIMENTS,
  batimentDuNiveau,
  fenetresAllumees,
  souvenirs,
} from "./batiments";

describe("bâtiments", () => {
  it("propose 20 niveaux aux noms uniques", () => {
    expect(BATIMENTS).toHaveLength(20);
    expect(new Set(BATIMENTS.map((b) => b.id)).size).toBe(20);
  });

  it("a des bâtiments de plus en plus grands", () => {
    const tailles = BATIMENTS.map((b) => b.fenetres.length);
    expect([...tailles].sort((a, b) => a - b)).toEqual(tailles);
  });

  it.each(BATIMENTS.map((b) => [b.nom, b] as const))(
    "%s a ses fenêtres dans le cadre, au-dessus du sol",
    (_, batiment) => {
      for (const { x, y, l, h } of batiment.fenetres) {
        expect(x).toBeGreaterThanOrEqual(0);
        expect(y).toBeGreaterThanOrEqual(0);
        expect(x + l).toBeLessThanOrEqual(200);
        expect(y + h).toBeLessThanOrEqual(124);
      }
    },
  );

  it.each(BATIMENTS.map((b) => [b.nom, b] as const))(
    "%s a une phrase correcte",
    (_, b) => {
      expect(b.destination).toMatch(/^(au |à la |à l')/);
      expect(b.nom.startsWith(b.pronom) || b.nom.startsWith("l'")).toBe(true);
    },
  );
});

describe("bâtiment du niveau", () => {
  it("commence par la tente et monte d'un bâtiment par semaine vaincue", () => {
    expect([0, 1, 2].map((n) => batimentDuNiveau(n).id)).toEqual([
      "tente",
      "cabane",
      "roulotte",
    ]);
    expect(batimentDuNiveau(19).id).toBe("palais");
  });

  it("repart de la tente après le palais", () => {
    expect(batimentDuNiveau(20).id).toBe("tente");
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

describe("souvenirs", () => {
  it("rend chaque semaine vaincue au bâtiment de son niveau, la plus récente d'abord", () => {
    const liste = souvenirs(["2026-10-19", "2026-11-02"]);
    expect(liste.map((s) => [s.lundi, s.niveau, s.batiment.id])).toEqual([
      ["2026-11-02", 2, "cabane"],
      ["2026-10-19", 1, "tente"],
    ]);
  });

  it("continue de compter après le palais", () => {
    const lundis = Array.from({ length: BATIMENTS.length + 1 }, (_, i) =>
      String(i),
    );
    const [dernier] = souvenirs(lundis);
    expect(dernier.niveau).toBe(BATIMENTS.length + 1);
    expect(dernier.batiment).toBe(BATIMENTS[0]);
  });

  it("n'a rien à montrer sans semaine vaincue", () => {
    expect(souvenirs([])).toEqual([]);
  });
});
