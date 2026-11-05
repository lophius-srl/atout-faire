import { aujourdhuiPourLeFoyer } from "$lib/server/cartes";
import { etatVacances } from "$lib/vacances";
import { fail } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

const FORMAT_DATE = /^\d{4}-\d{2}-\d{2}$/;

export const load: PageServerLoad = async ({ parent }) => {
  const { foyer, vacances } = await parent();
  const aujourdhui = aujourdhuiPourLeFoyer(foyer.fuseau);
  return {
    aujourdhui,
    // Seule la période en cours ou à venir se modifie ; une période finie reste telle quelle.
    vacances,
    enCours: etatVacances(vacances, aujourdhui) === "en_cours",
  };
};

export const actions: Actions = {
  planifier: async ({ request, locals }) => {
    const donnees = await request.formData();
    const debut = String(donnees.get("debut") ?? "");
    const fin = String(donnees.get("fin") ?? "");
    if (!FORMAT_DATE.test(debut) || !FORMAT_DATE.test(fin)) {
      return fail(400, { erreur: "Choisis les dates de départ et de retour." });
    }
    const { error } = await locals.supabase.rpc("planifier_vacances", {
      debut,
      fin,
    });
    if (error) return fail(400, { erreur: error.message });
  },

  annuler: async ({ locals }) => {
    const { error } = await locals.supabase.rpc("annuler_vacances");
    if (error) return fail(500, { erreur: "Impossible d'annuler. Réessaie." });
  },
};
