import { describe, expect, it } from "vitest";
import {
  cartesAttendues,
  dateDansFuseau,
  jourDeLaSemaine,
  lundiDeLaSemaine,
  type TacheADistribuer,
} from "./distribution";

// Le 2026-11-03 est un mardi.
const MARDI = "2026-11-03";

function tache(modifications: Partial<TacheADistribuer>): TacheADistribuer {
  return {
    id: "vaisselle",
    nom: "Vaisselle",
    categorie: "cuisine",
    frequence: "quotidienne",
    jours: [2],
    penibilite: 2,
    fixePour: null,
    creeLe: "2026-10-01",
    ...modifications,
  };
}

const resume = (aujourdhui: string, taches: TacheADistribuer[]) =>
  cartesAttendues(taches, aujourdhui).map(
    (c) => `${c.tacheId} ${c.echeance} ${c.dateEcheance}`,
  );

describe("dates", () => {
  it("calcule le jour de la semaine et le lundi", () => {
    expect(jourDeLaSemaine(MARDI)).toBe(2);
    expect(jourDeLaSemaine("2026-11-08")).toBe(7);
    expect(lundiDeLaSemaine(MARDI)).toBe("2026-11-02");
    expect(lundiDeLaSemaine("2026-11-08")).toBe("2026-11-02");
    expect(lundiDeLaSemaine("2026-11-09")).toBe("2026-11-09");
  });

  it("lit la date dans le fuseau du foyer, pas en UTC", () => {
    // Lundi 23 h 30 à UTC = mardi 0 h 30 à Paris.
    const instant = new Date("2026-11-02T23:30:00Z");
    expect(dateDansFuseau(instant, "Europe/Paris")).toBe(MARDI);
    expect(dateDansFuseau(instant, "UTC")).toBe("2026-11-02");
  });
});

describe("cartes attendues", () => {
  it("donne la carte du mardi le mardi, pas avant", () => {
    expect(resume("2026-11-02", [tache({})])).toEqual([]);
    expect(resume(MARDI, [tache({})])).toEqual(["vaisselle jour 2026-11-03"]);
  });

  it("donne une carte indépendante pour chaque jour prévu", () => {
    const quotidienne = tache({ jours: [1, 2, 3] });
    expect(resume("2026-11-04", [quotidienne])).toEqual([
      "vaisselle jour 2026-11-02",
      "vaisselle jour 2026-11-03",
      "vaisselle jour 2026-11-04",
    ]);
  });

  it("donne la carte hebdo dès le lundi, datée du lundi", () => {
    const hebdo = tache({
      id: "aspirateur",
      frequence: "hebdomadaire",
      jours: null,
    });
    expect(resume("2026-11-02", [hebdo])).toEqual([
      "aspirateur semaine 2026-11-02",
    ]);
    expect(resume("2026-11-08", [hebdo])).toEqual([
      "aspirateur semaine 2026-11-02",
    ]);
  });

  it("met une tâche fixe directement dans la main du parent", () => {
    const [carte] = cartesAttendues([tache({ fixePour: "parent-b" })], MARDI);
    expect(carte.detenteur).toBe("parent-b");
  });

  it("ne rattrape pas les jours qui précèdent la création de la tâche", () => {
    const recente = tache({ jours: [1, 2, 3, 4], creeLe: "2026-11-04" });
    expect(resume("2026-11-05", [recente])).toEqual([
      "vaisselle jour 2026-11-04",
      "vaisselle jour 2026-11-05",
    ]);
  });

  it("donne toujours le même résultat : relancer ne crée rien de plus", () => {
    const taches = [tache({ jours: [1, 2] })];
    expect(cartesAttendues(taches, MARDI)).toEqual(
      cartesAttendues(taches, MARDI),
    );
  });
});
