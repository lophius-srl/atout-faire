import { describe, expect, it } from "vitest";
import { CATEGORIES } from "./categories";
import { lireSaisieTache } from "./deck";
import {
  MODELES,
  modelesDisponibles,
  trouverModele,
  type Modele,
} from "./modeles";

function enFormulaire(modele: Modele): FormData {
  const donnees = new FormData();
  donnees.set("nom", modele.nom);
  donnees.set("categorie", modele.categorie);
  donnees.set("frequence", modele.frequence);
  donnees.set("penibilite", String(modele.penibilite));
  for (const jour of modele.jours ?? []) donnees.append("jours", String(jour));
  return donnees;
}

describe("modèles de tâches", () => {
  it("en propose une vingtaine, aux noms uniques", () => {
    expect(MODELES.length).toBeGreaterThanOrEqual(20);
    expect(new Set(MODELES.map((m) => m.nom)).size).toBe(MODELES.length);
  });

  it("couvre toutes les catégories", () => {
    for (const categorie of CATEGORIES) {
      expect(MODELES.some((m) => m.categorie === categorie.id)).toBe(true);
    }
  });

  it.each(MODELES.map((m) => [m.nom, m] as const))(
    "« %s » est une tâche valide",
    (_, modele) => {
      expect(lireSaisieTache(enFormulaire(modele))).toEqual({
        ok: true,
        tache: { ...modele, fixePour: null },
      });
    },
  );
});

describe("modèles disponibles", () => {
  it("écarte ceux déjà présents dans le deck, sans tenir compte des majuscules", () => {
    const disponibles = modelesDisponibles(MODELES, [
      { nom: "vaisselle " },
      { nom: "Aspirateur" },
    ]);
    expect(disponibles.map((m) => m.nom)).not.toContain("Vaisselle");
    expect(disponibles.map((m) => m.nom)).not.toContain("Aspirateur");
    expect(disponibles).toHaveLength(MODELES.length - 2);
  });

  it("retrouve un modèle par son nom", () => {
    expect(trouverModele("Devoirs")?.categorie).toBe("enfants");
    expect(trouverModele("Inconnu")).toBeUndefined();
  });
});
