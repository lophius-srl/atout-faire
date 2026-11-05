import { describe, expect, it } from "vitest";
import { faitParLautre, mercisNonVus, messageMercis } from "./mercis";

describe("message des mercis reçus", () => {
  it("ne dit rien sans merci", () => {
    expect(messageMercis([])).toBeNull();
  });

  it("nomme la tâche", () => {
    expect(messageMercis(["Vaisselle"])).toBe(
      "💛 L'autre te dit merci pour « vaisselle » !",
    );
  });

  it("regroupe plusieurs mercis pour la même tâche", () => {
    expect(messageMercis(["Vaisselle", "Vaisselle"])).toBe(
      "💛 L'autre te dit merci pour « vaisselle » !",
    );
  });

  it("énumère jusqu'à trois tâches", () => {
    expect(messageMercis(["Vaisselle", "Bain", "Linge"])).toBe(
      "💛 L'autre te dit merci pour « vaisselle », « bain » et « linge » !",
    );
  });

  it("résume au-delà", () => {
    expect(messageMercis(["Vaisselle", "Bain", "Linge", "Courses"])).toBe(
      "💛 L'autre te dit merci pour « vaisselle » et 3 autres tâches !",
    );
  });
});

describe("mercis à montrer et cartes à remercier", () => {
  const carte = (
    id: string,
    tache: string,
    detenteur: string | null,
    retournee: boolean,
    dateEcheance: string,
  ) => ({
    carte: {
      id,
      tache,
      categorie: "cuisine" as const,
      echeance: { type: "semaine" as const },
      retournee,
    },
    detenteur,
    dateEcheance,
  });
  const cartes = [
    carte("c1", "Vaisselle", "b", true, "2026-11-02"),
    carte("c2", "Bain", "b", true, "2026-11-03"),
    carte("c3", "Linge", "b", false, "2026-11-03"),
    carte("c4", "Courses", "a", true, "2026-11-03"),
    carte("c5", "Repas", null, false, "2026-11-03"),
  ];

  it("liste ce que l'autre a fait, du plus récent au plus ancien, avec les mercis déjà dits", () => {
    const resultat = faitParLautre(
      cartes,
      [{ carte_id: "c1", de: "a", pour: "b", vu: false }],
      "a",
    );
    expect(resultat.map((r) => [r.carte.id, r.dejaRemerciee])).toEqual([
      ["c2", false],
      ["c1", true],
    ]);
  });

  it("ne montre que les mercis reçus et pas encore vus", () => {
    const mercis = [
      { carte_id: "c4", de: "b", pour: "a", vu: false },
      { carte_id: "c1", de: "a", pour: "b", vu: false },
      { carte_id: "c4", de: "b", pour: "a", vu: true },
    ];
    expect(mercisNonVus(mercis, cartes, "a")).toBe(
      "💛 L'autre te dit merci pour « courses » !",
    );
    expect(mercisNonVus([], cartes, "a")).toBeNull();
  });
});
