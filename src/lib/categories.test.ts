import { describe, expect, it } from "vitest";
import { CATEGORIES, trouverCategorie } from "./categories";

describe("catégories de cartes", () => {
  it("a des identifiants uniques", () => {
    const ids = CATEGORIES.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("définit des couleurs hexadécimales", () => {
    for (const c of CATEGORIES) {
      expect(c.couleur).toMatch(/^#[0-9a-f]{6}$/);
      expect(c.encre).toMatch(/^#[0-9a-f]{6}$/);
    }
  });

  it("retrouve une catégorie par son identifiant", () => {
    expect(trouverCategorie("enfants").nom).toBe("Enfants");
  });

  it("refuse une catégorie inconnue", () => {
    expect(() => trouverCategorie("jardin")).toThrow("Catégorie inconnue");
  });
});
