import { describe, expect, it } from "vitest";
import {
  estPassee,
  libelleFrequence,
  libellePenibilite,
  lireSaisieTache,
} from "./deck";

// Le 2026-11-05 est un jeudi.
const AUJOURDHUI = "2026-11-05";

function formulaire(champs: Record<string, string | string[]>): FormData {
  const donnees = new FormData();
  for (const [champ, valeur] of Object.entries(champs)) {
    for (const v of [valeur].flat()) donnees.append(champ, v);
  }
  return donnees;
}

const valide = {
  nom: "  Vaisselle ",
  categorie: "cuisine",
  frequence: "quotidienne",
  jours: ["3", "1", "3"],
  penibilite: "2",
};

describe("saisie d'une tâche", () => {
  it("accepte une tâche quotidienne et range les jours", () => {
    const resultat = lireSaisieTache(formulaire(valide), AUJOURDHUI);
    expect(resultat).toEqual({
      ok: true,
      tache: {
        nom: "Vaisselle",
        categorie: "cuisine",
        frequence: "quotidienne",
        jours: [1, 3],
        dateUnique: null,
        penibilite: 2,
        fixePour: null,
      },
    });
  });

  it("ignore les jours d'une tâche hebdomadaire et garde la tâche fixe", () => {
    const resultat = lireSaisieTache(
      formulaire({ ...valide, frequence: "hebdomadaire", fixePour: "abc" }),
      AUJOURDHUI,
    );
    expect(resultat.ok && resultat.tache.jours).toBeNull();
    expect(resultat.ok && resultat.tache.fixePour).toBe("abc");
  });

  it("accepte une tâche ponctuelle datée d'aujourd'hui ou plus tard, sans jours", () => {
    for (const date of [AUJOURDHUI, "2026-12-24"]) {
      const resultat = lireSaisieTache(
        formulaire({ ...valide, frequence: "ponctuelle", dateUnique: date }),
        AUJOURDHUI,
      );
      expect(resultat.ok && resultat.tache).toMatchObject({
        frequence: "ponctuelle",
        dateUnique: date,
        jours: null,
      });
    }
  });

  it("oublie la date d'une tâche qui n'est pas ponctuelle", () => {
    const resultat = lireSaisieTache(
      formulaire({ ...valide, dateUnique: "2026-12-24" }),
      AUJOURDHUI,
    );
    expect(resultat.ok && resultat.tache.dateUnique).toBeNull();
  });

  it.each([
    [{ nom: "   " }, "Donne un nom à la tâche."],
    [{ nom: "x".repeat(61) }, "Le nom est trop long (60 caractères au plus)."],
    [{ categorie: "jardin" }, "Choisis une catégorie."],
    [{ frequence: "" }, "Choisis une fréquence."],
    [{ jours: [] }, "Choisis au moins un jour."],
    [{ jours: ["8"] }, "Choisis au moins un jour."],
    [{ penibilite: "" }, "Choisis une pénibilité."],
    [{ penibilite: "4" }, "Choisis une pénibilité."],
    [{ frequence: "ponctuelle" }, "Choisis la date de la tâche."],
    [
      { frequence: "ponctuelle", dateUnique: "12/11/2026" },
      "Choisis la date de la tâche.",
    ],
    [
      { frequence: "ponctuelle", dateUnique: "2026-11-04" },
      "Cette date est passée : choisis aujourd'hui ou plus tard.",
    ],
  ])("refuse %o avec un message clair", (modification, erreur) => {
    expect(
      lireSaisieTache(formulaire({ ...valide, ...modification }), AUJOURDHUI),
    ).toEqual({ ok: false, erreur });
  });
});

describe("libellés", () => {
  it.each([
    [[1, 2, 3, 4, 5, 6, 7], "Tous les jours"],
    [[1, 2, 3, 4, 5], "En semaine"],
    [[6, 7], "Le week-end"],
    [[1, 3, 5], "Lun, mer, ven"],
  ])("décrit les jours %o", (jours, libelle) => {
    expect(
      libelleFrequence({ frequence: "quotidienne", jours, dateUnique: null }),
    ).toBe(libelle);
  });

  it("décrit une tâche hebdomadaire", () => {
    expect(
      libelleFrequence({
        frequence: "hebdomadaire",
        jours: null,
        dateUnique: null,
      }),
    ).toBe("Une fois par semaine");
  });

  it("donne la date d'une tâche ponctuelle", () => {
    expect(
      libelleFrequence({
        frequence: "ponctuelle",
        jours: null,
        dateUnique: "2026-11-12",
      }),
    ).toBe("Le jeudi 12 novembre");
  });

  it("repère une tâche ponctuelle passée", () => {
    const ponctuelle = (dateUnique: string) => ({
      frequence: "ponctuelle" as const,
      dateUnique,
    });
    expect(estPassee(ponctuelle("2026-11-04"), AUJOURDHUI)).toBe(true);
    expect(estPassee(ponctuelle(AUJOURDHUI), AUJOURDHUI)).toBe(false);
    expect(
      estPassee({ frequence: "hebdomadaire", dateUnique: null }, AUJOURDHUI),
    ).toBe(false);
  });

  it("nomme la pénibilité", () => {
    expect(libellePenibilite(3)).toBe("Pénible");
  });
});
