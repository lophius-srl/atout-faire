import { describe, expect, it } from "vitest";
import {
  cartesEngagees,
  demandeUneCarte,
  reponsesPossibles,
  situationEchange,
  type Echange,
} from "./echanges";

function echange(modifications: Partial<Echange> = {}): Echange {
  return {
    id: "e1",
    proposePar: "a",
    carteOfferte: "carte-a",
    carteContre: null,
    statut: "en_attente",
    ...modifications,
  };
}

describe("réponses possibles", () => {
  it("laisse l'autre parent accepter, contre-proposer ou refuser une proposition", () => {
    expect(reponsesPossibles(echange(), "b")).toEqual([
      "accepter",
      "contre_proposer",
      "refuser",
    ]);
  });

  it("ne laisse pas répondre à sa propre proposition", () => {
    expect(reponsesPossibles(echange(), "a")).toEqual([]);
  });

  it("donne la main à celui qui a proposé en cas de contre-proposition", () => {
    const contre = echange({
      statut: "contre_proposition",
      carteContre: "carte-b",
    });
    expect(reponsesPossibles(contre, "a")).toEqual(["accepter", "refuser"]);
    expect(reponsesPossibles(contre, "b")).toEqual([]);
  });

  it.each(["accepte", "refuse", "annule"] as const)(
    "ne permet plus rien une fois %s",
    (statut) => {
      expect(reponsesPossibles(echange({ statut }), "b")).toEqual([]);
    },
  );
});

describe("choix d'une carte", () => {
  it("est demandé pour accepter ou contre-proposer une proposition", () => {
    expect(demandeUneCarte("accepter", echange())).toBe(true);
    expect(demandeUneCarte("contre_proposer", echange())).toBe(true);
    expect(demandeUneCarte("refuser", echange())).toBe(false);
  });

  it("n'est pas demandé pour accepter une contre-proposition", () => {
    const contre = echange({
      statut: "contre_proposition",
      carteContre: "carte-b",
    });
    expect(demandeUneCarte("accepter", contre)).toBe(false);
  });
});

describe("cartes engagées", () => {
  it("liste les cartes des échanges en cours seulement", () => {
    const engagees = cartesEngagees([
      echange({ carteOfferte: "x" }),
      echange({
        statut: "contre_proposition",
        carteOfferte: "y",
        carteContre: "z",
      }),
      echange({ statut: "refuse", carteOfferte: "w" }),
    ]);
    expect([...engagees].sort()).toEqual(["x", "y", "z"]);
  });
});

describe("situation", () => {
  it("montre le refus à celui qui avait proposé", () => {
    expect(situationEchange(echange({ statut: "refuse" }), "a")).toBe(
      "A refusé ton échange",
    );
  });

  it("dit à chacun qui doit répondre", () => {
    expect(situationEchange(echange(), "a")).toBe("En attente de sa réponse");
    expect(situationEchange(echange(), "b")).toBe("Te propose un échange");
  });
});
