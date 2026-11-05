import { describe, expect, it } from "vitest";
import type { Carte } from "./cartes";
import {
  actionsConfirmees,
  avecRetournements,
  progressionOptimiste,
  sansCartesRetirees,
  type ActionOptimiste,
} from "./optimiste";
import type { Progression } from "./progression";

const carte = (id: string, retournee = false): Carte => ({
  id,
  tache: `Tâche ${id}`,
  categorie: "cuisine",
  echeance: { type: "jour", jour: "mardi" },
  retournee,
});

const attente = (...paires: [string, ActionOptimiste][]) => new Map(paires);

const progression = (p: Partial<Progression> = {}): Progression => ({
  retournees: 1,
  total: 4,
  resteDuJour: 1,
  jourFini: false,
  semaineFinie: false,
  ...p,
});

describe("cartes retirées tout de suite", () => {
  it("retire la carte piochée ou remise au Marché", () => {
    const cartes = [carte("a"), carte("b")];
    const restantes = sansCartesRetirees(
      cartes,
      attente(["a", { type: "retirer", depuis: "main" }]),
      (c) => c.id,
    );
    expect(restantes.map((c) => c.id)).toEqual(["b"]);
  });

  it("ne touche pas aux cartes retournées en attente", () => {
    const cartes = [carte("a")];
    expect(
      sansCartesRetirees(
        cartes,
        attente(["a", { type: "retourner", faite: true }]),
        (c) => c.id,
      ),
    ).toHaveLength(1);
  });

  it("garde la carte quand l'action est annulée", () => {
    const cartes = [carte("a")];
    expect(sansCartesRetirees(cartes, attente(), (c) => c.id)).toEqual(cartes);
  });
});

describe("cartes retournées tout de suite", () => {
  it("retourne la carte touchée", () => {
    const [a, b] = avecRetournements(
      [carte("a"), carte("b")],
      attente(["a", { type: "retourner", faite: true }]),
    );
    expect(a.retournee).toBe(true);
    expect(b.retournee).toBe(false);
  });

  it("remet une carte à faire", () => {
    const [a] = avecRetournements(
      [carte("a", true)],
      attente(["a", { type: "retourner", faite: false }]),
    );
    expect(a.retournee).toBe(false);
  });

  it("ne change rien quand le serveur a déjà retourné la carte", () => {
    const cartes = [carte("a", true)];
    const resultat = avecRetournements(
      cartes,
      attente(["a", { type: "retourner", faite: true }]),
    );
    expect(resultat[0]).toBe(cartes[0]);
  });
});

describe("progression tout de suite", () => {
  const duJour = new Set(["a"]);

  it("compte la carte retournée et finit la journée", () => {
    const p = progressionOptimiste(
      progression(),
      [carte("a")],
      attente(["a", { type: "retourner", faite: true }]),
      duJour,
    );
    expect(p).toMatchObject({ retournees: 2, resteDuJour: 0, jourFini: true });
  });

  it("finit la semaine avec la dernière carte", () => {
    const p = progressionOptimiste(
      progression({ retournees: 3 }),
      [carte("b")],
      attente(["b", { type: "retourner", faite: true }]),
      duJour,
    );
    expect(p).toMatchObject({ retournees: 4, semaineFinie: true });
    expect(p.jourFini).toBe(false);
  });

  it("défait la journée quand on remet une carte du jour à faire", () => {
    const p = progressionOptimiste(
      progression({ retournees: 2, resteDuJour: 0, jourFini: true }),
      [carte("a", true)],
      attente(["a", { type: "retourner", faite: false }]),
      duJour,
    );
    expect(p).toMatchObject({ retournees: 1, resteDuJour: 1, jourFini: false });
  });

  it("ne compte pas deux fois une carte déjà retournée par le serveur", () => {
    const depart = progression({
      retournees: 2,
      resteDuJour: 0,
      jourFini: true,
    });
    const p = progressionOptimiste(
      depart,
      [carte("a", true)],
      attente(["a", { type: "retourner", faite: true }]),
      duJour,
    );
    expect(p).toBe(depart);
  });

  it("ignore les cartes qui quittent la main", () => {
    const depart = progression();
    expect(
      progressionOptimiste(
        depart,
        [carte("a")],
        attente(["a", { type: "retirer", depuis: "main" }]),
        duJour,
      ),
    ).toBe(depart);
  });
});

describe("actions confirmées par le serveur", () => {
  it("confirme le retournement quand la carte du serveur est retournée", () => {
    const enAttente = attente(["a", { type: "retourner", faite: true }]);
    expect(actionsConfirmees(enAttente, [carte("a", true)], "main")).toEqual([
      "a",
    ]);
  });

  it("attend tant que le serveur montre encore l'ancien état", () => {
    const enAttente = attente(
      ["a", { type: "retourner", faite: true }],
      ["b", { type: "retirer", depuis: "main" }],
    );
    expect(
      actionsConfirmees(enAttente, [carte("a"), carte("b")], "main"),
    ).toEqual([]);
  });

  it("confirme la carte retirée quand elle a quitté la liste", () => {
    const enAttente = attente(["b", { type: "retirer", depuis: "marche" }]);
    expect(actionsConfirmees(enAttente, [carte("a")], "marche")).toEqual(["b"]);
  });

  it("laisse aux autres listes les actions qui ne sont pas les siennes", () => {
    const enAttente = attente(
      ["a", { type: "retourner", faite: true }],
      ["b", { type: "retirer", depuis: "main" }],
    );
    expect(actionsConfirmees(enAttente, [], "marche")).toEqual([]);
  });
});
