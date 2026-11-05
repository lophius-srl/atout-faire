import { dateDansFuseau, type DateLocale } from "./distribution";

/** Une récompense commune, posée sur un boss (niveau affiché, 1 = la tente). */
export interface Recompense {
  id: string;
  niveau: number;
  description: string;
  proposeePar: string;
  acceptee: boolean;
  profitee: boolean;
  /** Instant (ISO) où elle a été vécue ; absent pour celles vécues avant qu'on le note. */
  profiteeLe: string | null;
}

export type StatutRecompense =
  "a_accepter" | "attend_accord" | "acceptee" | "debloquee" | "profitee";

export const DESCRIPTION_MAX = 80;

/** Où en est la récompense, de mon point de vue. `bossVaincus` : nombre de boss vaincus. */
export function statutRecompense(
  recompense: Recompense,
  moi: string,
  bossVaincus: number,
): StatutRecompense {
  if (recompense.profitee) return "profitee";
  if (!recompense.acceptee) {
    return recompense.proposeePar === moi ? "attend_accord" : "a_accepter";
  }
  return recompense.niveau <= bossVaincus ? "debloquee" : "acceptee";
}

/** La récompense acceptée posée sur ce boss, s'il y en a une. */
export function recompenseDuBoss(
  recompenses: readonly Recompense[],
  niveau: number,
): Recompense | null {
  return (
    recompenses.find((r) => r.niveau === niveau && r.acceptee && !r.profitee) ??
    null
  );
}

/** Les boss sur lesquels on peut encore poser une récompense : à venir et sans récompense. */
export function bossDisponibles(
  recompenses: readonly Recompense[],
  bossEnCours: number,
  combien = 20,
): number[] {
  const pris = new Set(recompenses.map((r) => r.niveau));
  return Array.from({ length: combien }, (_, i) => bossEnCours + i).filter(
    (n) => !pris.has(n),
  );
}

export type ResultatProposition =
  | { ok: true; niveau: number; description: string }
  | { ok: false; erreur: string };

export function lireProposition(
  donnees: FormData,
  bossEnCours: number,
): ResultatProposition {
  const niveau = Number(donnees.get("niveau"));
  const description = String(donnees.get("description") ?? "").trim();
  if (!Number.isInteger(niveau) || niveau < bossEnCours) {
    return { ok: false, erreur: "Choisis un boss à venir." };
  }
  if (!description) return { ok: false, erreur: "Écris la récompense." };
  if (description.length > DESCRIPTION_MAX) {
    return {
      ok: false,
      erreur: `La récompense est trop longue (${DESCRIPTION_MAX} caractères au plus).`,
    };
  }
  return { ok: true, niveau, description };
}

/** Une récompense vécue, pour la galerie des souvenirs (sans dire qui l'a proposée). */
export interface RecompenseVecue {
  description: string;
  /** Jour où elle a été vécue, dans le fuseau du foyer, ou null s'il n'est pas connu. */
  le: DateLocale | null;
}

/** Les récompenses vécues, par niveau du boss qui les a débloquées. */
export function recompensesVecues(
  recompenses: readonly Recompense[],
  fuseau: string,
): Map<number, RecompenseVecue> {
  return new Map(
    recompenses
      .filter((r) => r.profitee)
      .map((r) => [
        r.niveau,
        {
          description: r.description,
          le: r.profiteeLe
            ? dateDansFuseau(new Date(r.profiteeLe), fuseau)
            : null,
        },
      ]),
  );
}
