import { describe, expect, it } from "vitest";
import {
  bossDisponibles,
  lireProposition,
  recompenseDuBoss,
  statutRecompense,
  type Recompense,
} from "./recompenses";

function recompense(modifications: Partial<Recompense> = {}): Recompense {
  return {
    id: "r1",
    niveau: 5,
    description: "Resto japonais",
    proposeePar: "a",
    acceptee: false,
    profitee: false,
    ...modifications,
  };
}

describe("statut d'une récompense", () => {
  it("attend l'accord de l'autre quand je l'ai proposée", () => {
    expect(statutRecompense(recompense(), "a", 0)).toBe("attend_accord");
  });

  it("est à accepter quand l'autre l'a proposée", () => {
    expect(statutRecompense(recompense(), "b", 0)).toBe("a_accepter");
  });

  it("est acceptée tant que le boss n'est pas vaincu", () => {
    expect(statutRecompense(recompense({ acceptee: true }), "a", 4)).toBe(
      "acceptee",
    );
  });

  it("est débloquée quand le boss est vaincu", () => {
    expect(statutRecompense(recompense({ acceptee: true }), "b", 5)).toBe(
      "debloquee",
    );
  });

  it("ne se débloque pas sans accord, même si le boss est vaincu", () => {
    expect(statutRecompense(recompense(), "b", 9)).toBe("a_accepter");
  });

  it("est profitée une fois vécue", () => {
    expect(
      statutRecompense(recompense({ acceptee: true, profitee: true }), "a", 9),
    ).toBe("profitee");
  });
});

describe("récompense du boss en cours", () => {
  it("ne montre qu'une récompense acceptée et pas encore vécue", () => {
    const recompenses = [
      recompense({ id: "x", niveau: 3 }),
      recompense({ id: "y", niveau: 4, acceptee: true }),
      recompense({ id: "z", niveau: 5, acceptee: true, profitee: true }),
    ];
    expect(recompenseDuBoss(recompenses, 3)).toBeNull();
    expect(recompenseDuBoss(recompenses, 4)?.id).toBe("y");
    expect(recompenseDuBoss(recompenses, 5)).toBeNull();
  });
});

describe("boss disponibles", () => {
  it("propose les boss à venir qui n'ont pas encore de récompense", () => {
    expect(bossDisponibles([recompense({ niveau: 4 })], 3, 4)).toEqual([
      3, 5, 6,
    ]);
  });
});

describe("saisie d'une proposition", () => {
  const formulaire = (niveau: string, description: string) => {
    const donnees = new FormData();
    donnees.set("niveau", niveau);
    donnees.set("description", description);
    return donnees;
  };

  it("accepte un boss à venir et nettoie le texte", () => {
    expect(lireProposition(formulaire("5", "  Ciné  "), 3)).toEqual({
      ok: true,
      niveau: 5,
      description: "Ciné",
    });
  });

  it.each([
    ["2", "Ciné", "Choisis un boss à venir."],
    ["x", "Ciné", "Choisis un boss à venir."],
    ["5", "   ", "Écris la récompense."],
    [
      "5",
      "x".repeat(81),
      "La récompense est trop longue (80 caractères au plus).",
    ],
  ])("refuse niveau %s / « %s »", (niveau, description, erreur) => {
    expect(lireProposition(formulaire(niveau, description), 3)).toEqual({
      ok: false,
      erreur,
    });
  });
});
