import { describe, expect, it } from "vitest";
import { libelleFrequence, libellePenibilite, lireSaisieTache } from "./deck";

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
    const resultat = lireSaisieTache(formulaire(valide));
    expect(resultat).toEqual({
      ok: true,
      tache: {
        nom: "Vaisselle",
        categorie: "cuisine",
        frequence: "quotidienne",
        jours: [1, 3],
        penibilite: 2,
        fixePour: null,
      },
    });
  });

  it("ignore les jours d'une tâche hebdomadaire et garde la tâche fixe", () => {
    const resultat = lireSaisieTache(
      formulaire({ ...valide, frequence: "hebdomadaire", fixePour: "abc" }),
    );
    expect(resultat.ok && resultat.tache.jours).toBeNull();
    expect(resultat.ok && resultat.tache.fixePour).toBe("abc");
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
  ])("refuse %o avec un message clair", (modification, erreur) => {
    expect(lireSaisieTache(formulaire({ ...valide, ...modification }))).toEqual(
      {
        ok: false,
        erreur,
      },
    );
  });
});

describe("libellés", () => {
  it.each([
    [[1, 2, 3, 4, 5, 6, 7], "Tous les jours"],
    [[1, 2, 3, 4, 5], "En semaine"],
    [[6, 7], "Le week-end"],
    [[1, 3, 5], "Lun, mer, ven"],
  ])("décrit les jours %o", (jours, libelle) => {
    expect(libelleFrequence({ frequence: "quotidienne", jours })).toBe(libelle);
  });

  it("décrit une tâche hebdomadaire", () => {
    expect(libelleFrequence({ frequence: "hebdomadaire", jours: null })).toBe(
      "Une fois par semaine",
    );
  });

  it("nomme la pénibilité", () => {
    expect(libellePenibilite(3)).toBe("Pénible");
  });
});
