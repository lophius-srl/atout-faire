import { batimentDuNiveau } from "$lib/batiments";
import { progressionDuFoyer } from "$lib/progression";
import {
  bossDisponibles,
  lireProposition,
  statutRecompense,
} from "$lib/recompenses";
import {
  aujourdhuiPourLeFoyer,
  listerCartesDeLaSemaine,
  semainesVaincues,
} from "$lib/server/cartes";
import { listerRecompenses } from "$lib/server/recompenses";
import { lundiDeLaSemaine } from "$lib/distribution";
import { DEPENDANCE_CARTES } from "$lib/temps-reel";
import { fail } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

const nomDuBoss = (niveau: number) => batimentDuNiveau(niveau - 1).nom;

export const load: PageServerLoad = async ({ locals, parent, depends }) => {
  depends(DEPENDANCE_CARTES);
  const { foyer, cartesPrevues } = await parent();
  const aujourdhui = aujourdhuiPourLeFoyer(foyer.fuseau);
  const [utilisateur, cartes, vaincues, recompenses] = await Promise.all([
    locals.utilisateurConnecte(),
    listerCartesDeLaSemaine(locals.supabase, aujourdhui),
    semainesVaincues(locals.supabase, lundiDeLaSemaine(aujourdhui)),
    listerRecompenses(locals.supabase),
  ]);
  const progression = progressionDuFoyer(
    cartes.map((c) => ({
      retournee: c.carte.retournee,
      echeance: c.carte.echeance.type,
      dateEcheance: c.dateEcheance,
    })),
    aujourdhui,
    cartesPrevues,
  );
  // Le boss de la semaine compte comme vaincu dès que toutes ses cartes sont retournées.
  const bossVaincus = vaincues + (progression.semaineFinie ? 1 : 0);
  const bossEnCours = vaincues + 1;
  const moi = utilisateur?.id ?? "";
  return {
    bossEnCours,
    recompenses: recompenses.map((r) => ({
      ...r,
      boss: nomDuBoss(r.niveau),
      statut: statutRecompense(r, moi, bossVaincus),
    })),
    disponibles: bossDisponibles(recompenses, bossEnCours).map((niveau) => ({
      niveau,
      boss: nomDuBoss(niveau),
    })),
  };
};

async function appeler(
  locals: App.Locals,
  fonction: string,
  parametres: Record<string, unknown>,
) {
  const { error } = await locals.supabase.rpc(fonction, parametres);
  return error ? fail(400, { erreur: error.message }) : undefined;
}

export const actions: Actions = {
  proposer: async ({ request, locals }) => {
    // Même règle que l'affichage : le boss en cours suit les semaines vaincues avant ce lundi.
    const lundi = lundiDeLaSemaine(new Date().toISOString().slice(0, 10));
    const vaincues = await semainesVaincues(locals.supabase, lundi);
    const saisie = lireProposition(await request.formData(), vaincues + 1);
    if (!saisie.ok) return fail(400, { erreur: saisie.erreur });
    return appeler(locals, "proposer_recompense", {
      niveau_boss: saisie.niveau,
      texte: saisie.description,
    });
  },
  accepter: async ({ request, locals }) =>
    appeler(locals, "accepter_recompense", {
      recompense: String((await request.formData()).get("recompense") ?? ""),
    }),
  retirer: async ({ request, locals }) =>
    appeler(locals, "retirer_recompense", {
      recompense: String((await request.formData()).get("recompense") ?? ""),
    }),
  profiter: async ({ request, locals }) =>
    appeler(locals, "profiter_recompense", {
      recompense: String((await request.formData()).get("recompense") ?? ""),
    }),
};
