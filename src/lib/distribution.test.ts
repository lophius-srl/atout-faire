import { describe, expect, it } from "vitest";
import {
  cartesAttendues,
  dateDansFuseau,
  jourDeLaSemaine,
  lundiDeLaSemaine,
  prochaineSemaineDuMois,
  type TacheADistribuer,
} from "./distribution";
import type { Vacances } from "./vacances";

// Le 2026-11-03 est un mardi.
const MARDI = "2026-11-03";

function tache(modifications: Partial<TacheADistribuer>): TacheADistribuer {
  return {
    id: "vaisselle",
    nom: "Vaisselle",
    categorie: "cuisine",
    frequence: "quotidienne",
    jours: [2],
    dateUnique: null,
    penibilite: 2,
    fixePour: null,
    creeLe: "2026-10-01",
    ...modifications,
  };
}

const resume = (
  aujourdhui: string,
  taches: TacheADistribuer[],
  vacances: readonly Vacances[] = [],
) =>
  cartesAttendues(taches, aujourdhui, vacances).map(
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

  describe("tâche ponctuelle", () => {
    const rdv = (dateUnique: string) =>
      tache({
        id: "rdv",
        frequence: "ponctuelle",
        jours: null,
        dateUnique,
      });

    it("donne une seule carte du jour, à sa date", () => {
      expect(resume("2026-11-05", [rdv("2026-11-05")])).toEqual([
        "rdv jour 2026-11-05",
      ]);
      expect(resume("2026-11-08", [rdv("2026-11-05")])).toEqual([
        "rdv jour 2026-11-05",
      ]);
    });

    it("ne donne rien avant sa date ni une autre semaine", () => {
      expect(resume("2026-11-04", [rdv("2026-11-05")])).toEqual([]);
      expect(resume("2026-11-12", [rdv("2026-11-05")])).toEqual([]);
    });

    it("compte dans les cartes prévues de la semaine", () => {
      expect(resume("2026-11-08", [rdv("2026-11-07")])).toEqual([
        "rdv jour 2026-11-07",
      ]);
    });
  });

  describe("toutes les deux semaines", () => {
    // Créée le mercredi 4 novembre : semaine du 2 novembre.
    const draps = tache({
      id: "draps",
      frequence: "bimensuelle",
      jours: null,
      creeLe: "2026-11-04",
    });

    it("donne une carte de la semaine une semaine sur deux, dès la semaine de création", () => {
      expect(resume("2026-11-04", [draps])).toEqual([
        "draps semaine 2026-11-02",
      ]);
      expect(resume("2026-11-10", [draps])).toEqual([]);
      expect(resume("2026-11-16", [draps])).toEqual([
        "draps semaine 2026-11-16",
      ]);
      expect(resume("2026-11-23", [draps])).toEqual([]);
    });

    it("garde le rythme d'une année sur l'autre", () => {
      expect(resume("2026-12-28", [draps])).toEqual([
        "draps semaine 2026-12-28",
      ]);
      expect(resume("2027-01-04", [draps])).toEqual([]);
    });

    it("ne donne rien avant la semaine de création", () => {
      expect(resume("2026-10-26", [draps])).toEqual([]);
    });
  });

  describe("une fois par mois", () => {
    const frigo = (creeLe: string) =>
      tache({ id: "frigo", frequence: "mensuelle", jours: null, creeLe });

    it("donne une carte la première semaine du mois seulement", () => {
      const taches = [frigo("2026-10-01")];
      expect(resume("2026-11-05", taches)).toEqual([
        "frigo semaine 2026-11-02",
      ]);
      expect(resume("2026-11-12", taches)).toEqual([]);
      expect(resume("2026-11-30", taches)).toEqual([]);
      expect(resume("2026-12-07", taches)).toEqual([
        "frigo semaine 2026-12-07",
      ]);
      expect(resume("2027-01-04", taches)).toEqual([
        "frigo semaine 2027-01-04",
      ]);
    });

    it("attend le mois suivant quand elle est créée après la première semaine", () => {
      const taches = [frigo("2026-11-10")];
      expect(resume("2026-11-10", taches)).toEqual([]);
      expect(resume("2026-12-07", taches)).toEqual([
        "frigo semaine 2026-12-07",
      ]);
    });

    it("donne la carte du mois quand elle est créée pendant la première semaine", () => {
      expect(resume("2026-11-05", [frigo("2026-11-04")])).toEqual([
        "frigo semaine 2026-11-02",
      ]);
    });

    it("annonce la prochaine semaine prévue", () => {
      expect(prochaineSemaineDuMois("2026-11-05")).toBe("2026-11-02");
      expect(prochaineSemaineDuMois("2026-11-10")).toBe("2026-12-07");
      expect(prochaineSemaineDuMois("2026-12-31")).toBe("2027-01-04");
    });
  });

  describe("vacances", () => {
    const quotidienne = tache({ jours: [1, 2, 3, 4, 5, 6, 7] });
    const linge = tache({
      id: "linge",
      frequence: "hebdomadaire",
      jours: null,
    });
    const rdv = tache({
      id: "rdv",
      frequence: "ponctuelle",
      jours: null,
      dateUnique: "2026-11-04",
    });

    it("ne donne aucune carte pendant les jours de vacances", () => {
      const vacances = [{ debut: "2026-11-04", fin: "2026-11-20" }];
      expect(resume("2026-11-05", [quotidienne, rdv], vacances)).toEqual([
        "vaisselle jour 2026-11-02",
        "vaisselle jour 2026-11-03",
      ]);
    });

    it("garde la carte de la semaine quand la semaine est en partie en vacances", () => {
      const vacances = [{ debut: "2026-11-04", fin: "2026-11-20" }];
      expect(resume("2026-11-05", [linge], vacances)).toEqual([
        "linge semaine 2026-11-02",
      ]);
    });

    it("ne donne rien du tout pour une semaine entièrement en vacances", () => {
      const vacances = [{ debut: "2026-10-31", fin: "2026-11-08" }];
      expect(resume("2026-11-08", [quotidienne, linge], vacances)).toEqual([]);
    });

    it("ne redonne pas les jours d'une période finie quand une autre est prévue", () => {
      const vacances = [
        { debut: "2026-10-31", fin: "2026-11-03" },
        { debut: "2026-12-20", fin: "2027-01-03" },
      ];
      expect(resume("2026-11-05", [quotidienne], vacances)).toEqual([
        "vaisselle jour 2026-11-04",
        "vaisselle jour 2026-11-05",
      ]);
    });
  });
});
