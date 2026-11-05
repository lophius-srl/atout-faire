import type { Carte } from "./cartes";
import type { Progression } from "./progression";

/** La liste d'où part l'action : ma main ou le Marché. */
export type Liste = "main" | "marche";

/**
 * Ce qu'on montre tout de suite, avant la réponse du serveur :
 * une carte de ma main retournée (ou remise à faire), ou une carte qui quitte sa liste
 * (piochée depuis le Marché, remise au Marché depuis ma main).
 */
export type ActionOptimiste =
  { type: "retourner"; faite: boolean } | { type: "retirer"; depuis: Liste };

/** Actions en attente de réponse, par identifiant de carte. */
export type EnAttente = ReadonlyMap<string, ActionOptimiste>;

/**
 * Retire les cartes qui quittent la liste. Sans effet si le serveur les a déjà retirées :
 * on peut l'appliquer sur des données fraîches sans risque.
 */
export function sansCartesRetirees<T>(
  elements: readonly T[],
  enAttente: EnAttente,
  idDe: (element: T) => string,
): T[] {
  return elements.filter(
    (element) => enAttente.get(idDe(element))?.type !== "retirer",
  );
}

/** Applique les retournements en attente. On fixe l'état visé : appliquer deux fois ne change rien. */
export function avecRetournements(
  cartes: readonly Carte[],
  enAttente: EnAttente,
): Carte[] {
  return cartes.map((carte) => {
    const action = enAttente.get(carte.id);
    return action?.type === "retourner" && action.faite !== carte.retournee
      ? { ...carte, retournee: action.faite }
      : carte;
  });
}

/**
 * Progression du foyer avec les retournements en attente.
 * `cartes` : les cartes telles que le serveur les a renvoyées (avant l'affichage optimiste).
 * `duJour` : identifiants des cartes d'aujourd'hui.
 */
export function progressionOptimiste(
  progression: Progression,
  cartes: readonly Carte[],
  enAttente: EnAttente,
  duJour: ReadonlySet<string>,
): Progression {
  let ecart = 0;
  let ecartDuJour = 0;
  for (const carte of cartes) {
    const action = enAttente.get(carte.id);
    if (action?.type !== "retourner" || action.faite === carte.retournee) {
      continue;
    }
    const sens = action.faite ? 1 : -1;
    ecart += sens;
    if (duJour.has(carte.id)) ecartDuJour += sens;
  }
  if (ecart === 0) return progression;

  const retournees = progression.retournees + ecart;
  const resteDuJour = progression.resteDuJour - ecartDuJour;
  return {
    ...progression,
    retournees,
    resteDuJour,
    jourFini: ecartDuJour === 0 ? progression.jourFini : resteDuJour === 0,
    semaineFinie: progression.total > 0 && retournees >= progression.total,
  };
}

/**
 * Cartes dont l'action en attente se voit déjà dans les données du serveur pour `liste` :
 * on peut cesser de la simuler. On attend ces données plutôt que la seule réponse du serveur,
 * car un rechargement lancé par le temps réel peut encore apporter l'ancien état.
 */
export function actionsConfirmees(
  enAttente: EnAttente,
  cartes: readonly Carte[],
  liste: Liste,
): string[] {
  const parId = new Map(cartes.map((carte) => [carte.id, carte]));
  return [...enAttente]
    .filter(([id, action]) => {
      const depuis = action.type === "retourner" ? "main" : action.depuis;
      if (depuis !== liste) return false;
      const carte = parId.get(id);
      return (
        !carte ||
        (action.type === "retourner" && carte.retournee === action.faite)
      );
    })
    .map(([id]) => id);
}
