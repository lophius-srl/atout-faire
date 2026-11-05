import { describe, expect, it } from "vitest";
import { aFeter, progressionDuFoyer } from "./progression";

const MARDI = "2026-11-03";
const carte = (
  echeance: "jour" | "semaine",
  dateEcheance: string,
  retournee: boolean,
) => ({
  echeance,
  dateEcheance,
  retournee,
});

describe("progression du foyer", () => {
  it("compte les cartes retournées ensemble", () => {
    const p = progressionDuFoyer(
      [carte("jour", MARDI, true), carte("semaine", "2026-11-02", false)],
      MARDI,
    );
    expect(p).toMatchObject({ retournees: 1, total: 2, semaineFinie: false });
  });

  it("finit la journée quand toutes les cartes du jour sont retournées", () => {
    const cartes = [
      carte("jour", MARDI, true),
      carte("jour", MARDI, true),
      carte("jour", "2026-11-04", false),
      carte("semaine", "2026-11-02", false),
    ];
    expect(progressionDuFoyer(cartes, MARDI).jourFini).toBe(true);
  });

  it("compte les cartes du jour qui restent à faire", () => {
    const cartes = [
      carte("jour", MARDI, true),
      carte("jour", MARDI, false),
      carte("jour", "2026-11-04", false),
      carte("semaine", "2026-11-02", false),
    ];
    expect(progressionDuFoyer(cartes, MARDI).resteDuJour).toBe(1);
  });

  it("ne finit pas une journée sans cartes", () => {
    expect(
      progressionDuFoyer([carte("semaine", "2026-11-02", true)], MARDI)
        .jourFini,
    ).toBe(false);
  });

  it("finit la semaine quand tout est retourné", () => {
    const p = progressionDuFoyer(
      [carte("jour", MARDI, true), carte("semaine", "2026-11-02", true)],
      MARDI,
    );
    expect(p.semaineFinie).toBe(true);
  });
});

describe("ce qu'il faut fêter", () => {
  const rien = { jourFini: false, semaineFinie: false };

  it("fête la journée quand elle vient de se terminer", () => {
    expect(aFeter(rien, { jourFini: true, semaineFinie: false })).toBe("jour");
  });

  it("préfère fêter la semaine quand les deux se terminent ensemble", () => {
    expect(aFeter(rien, { jourFini: true, semaineFinie: true })).toBe(
      "semaine",
    );
  });

  it("ne refête pas ce qui était déjà fini", () => {
    const fini = { jourFini: true, semaineFinie: false };
    expect(aFeter(fini, fini)).toBeNull();
  });
});

describe("semaine finie et cartes à venir", () => {
  it("n'est pas finie tant que des cartes des jours suivants sont prévues", () => {
    const cartes = [
      carte("jour", MARDI, true),
      carte("semaine", "2026-11-02", true),
    ];
    const p = progressionDuFoyer(cartes, MARDI, 6);
    expect(p).toMatchObject({ retournees: 2, total: 6, semaineFinie: false });
  });

  it("est finie quand les cartes prévues sont toutes retournées", () => {
    const cartes = [
      carte("jour", MARDI, true),
      carte("semaine", "2026-11-02", true),
    ];
    expect(progressionDuFoyer(cartes, MARDI, 2).semaineFinie).toBe(true);
  });
});
