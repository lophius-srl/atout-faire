import { describe, expect, it } from "vitest";
import { estUnGout, facteurGout, GOUT_PAR_DEFAUT } from "./gouts";

describe("goûts", () => {
  it("applique les facteurs de la règle de la balance", () => {
    expect(facteurGout("aime")).toBe(0.5);
    expect(facteurGout("neutre")).toBe(1);
    expect(facteurGout("naime_pas")).toBe(1.5);
  });

  it("est neutre par défaut", () => {
    expect(GOUT_PAR_DEFAUT).toBe("neutre");
  });

  it("reconnaît les valeurs autorisées", () => {
    expect(estUnGout("aime")).toBe(true);
    expect(estUnGout("adore")).toBe(false);
    expect(estUnGout(null)).toBe(false);
  });
});
