import { afterEach, describe, expect, it, vi } from "vitest";
import type { Carte } from "./cartes";
import type { ActionOptimiste } from "./optimiste";
import {
  actionsEnAttente,
  attendreConfirmation,
  commencerAction,
  DELAI_SECOURS_MS,
  oublierAction,
  oublierConfirmees,
} from "./optimiste.svelte";

const carte = (id: string, retournee = false): Carte => ({
  id,
  tache: `Tâche ${id}`,
  categorie: "cuisine",
  echeance: { type: "semaine" },
  retournee,
});

const faite: ActionOptimiste = { type: "retourner", faite: true };

afterEach(() => {
  actionsEnAttente.clear();
  vi.useRealTimers();
});

describe("vie d'une action en attente", () => {
  it("ignore un second toucher sur la même carte", () => {
    expect(commencerAction("a", faite)).toBe(true);
    expect(commencerAction("a", { type: "retirer", depuis: "main" })).toBe(
      false,
    );
    expect(actionsEnAttente.get("a")).toBe(faite);
  });

  it("oublie l'action quand le serveur refuse", () => {
    commencerAction("a", faite);
    oublierAction("a", faite);
    expect(actionsEnAttente.has("a")).toBe(false);
  });

  it("n'oublie pas une action plus récente sur la même carte", () => {
    const remise: ActionOptimiste = { type: "retourner", faite: false };
    commencerAction("a", remise);
    oublierAction("a", faite);
    expect(actionsEnAttente.get("a")).toBe(remise);
  });

  it("garde l'action tant que les données montrent l'ancien état", () => {
    commencerAction("a", faite);
    oublierConfirmees([carte("a", false)], "main");
    expect(actionsEnAttente.has("a")).toBe(true);
    oublierConfirmees([carte("a", true)], "main");
    expect(actionsEnAttente.has("a")).toBe(false);
  });

  it("finit par oublier l'action si les données fraîches tardent", () => {
    vi.useFakeTimers();
    commencerAction("a", faite);
    attendreConfirmation("a", faite);
    vi.advanceTimersByTime(DELAI_SECOURS_MS - 1);
    expect(actionsEnAttente.has("a")).toBe(true);
    vi.advanceTimersByTime(1);
    expect(actionsEnAttente.has("a")).toBe(false);
  });
});
