import { describe, expect, it } from "vitest";
import {
  bandeauVacances,
  estEnVacances,
  etatVacances,
  periodeActive,
  semaineEnVacances,
} from "./vacances";

// Du samedi 7 au dimanche 15 novembre 2026 : couvre toute la semaine du lundi 9.
const VACANCES = { debut: "2026-11-07", fin: "2026-11-15" };

describe("vacances", () => {
  it("couvre les jours de la période, bornes comprises", () => {
    expect(estEnVacances("2026-11-07", [VACANCES])).toBe(true);
    expect(estEnVacances("2026-11-15", [VACANCES])).toBe(true);
    expect(estEnVacances("2026-11-06", [VACANCES])).toBe(false);
    expect(estEnVacances("2026-11-07", [])).toBe(false);
  });

  it("ne couvre une semaine que si elle est entièrement en vacances", () => {
    expect(semaineEnVacances("2026-11-09", [VACANCES])).toBe(true);
    expect(semaineEnVacances("2026-11-02", [VACANCES])).toBe(false);
    expect(semaineEnVacances("2026-11-16", [VACANCES])).toBe(false);
  });

  it("garde couverts les jours d'une période finie, à côté de la suivante", () => {
    const finie = { debut: "2026-10-31", fin: "2026-11-04" };
    const noel = { debut: "2026-12-20", fin: "2027-01-03" };
    expect(estEnVacances("2026-11-03", [finie, noel])).toBe(true);
    expect(periodeActive([finie, noel], "2026-11-05")).toBe(noel);
    expect(periodeActive([finie], "2026-11-05")).toBeNull();
  });

  it("dit si la période est à venir, en cours ou finie", () => {
    expect(etatVacances(VACANCES, "2026-11-05")).toBe("a_venir");
    expect(etatVacances(VACANCES, "2026-11-07")).toBe("en_cours");
    expect(etatVacances(VACANCES, "2026-11-16")).toBeNull();
    expect(etatVacances(null, "2026-11-05")).toBeNull();
  });

  it("annonce la période dans un bandeau commun", () => {
    expect(bandeauVacances(VACANCES, "2026-11-10")).toBe(
      "En vacances jusqu'au 15 novembre 🌴",
    );
    expect(bandeauVacances(VACANCES, "2026-11-01")).toBe(
      "Vacances prévues du 7 novembre au 15 novembre 🌴",
    );
    expect(bandeauVacances(VACANCES, "2026-11-20")).toBeNull();
  });
});
