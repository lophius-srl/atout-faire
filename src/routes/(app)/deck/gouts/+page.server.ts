import { estUnGout } from "$lib/gouts";
import { listerTaches } from "$lib/server/deck";
import { enregistrerMonGout, listerMesGouts } from "$lib/server/gouts";
import { fail } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => ({
  taches: await listerTaches(locals.supabase),
  gouts: await listerMesGouts(locals.supabase),
});

export const actions: Actions = {
  choisir: async ({ request, locals }) => {
    const donnees = await request.formData();
    const tache = String(donnees.get("tache") ?? "");
    const gout = donnees.get("gout");
    const moi = (await locals.utilisateurConnecte())?.id;
    if (!moi || !estUnGout(gout)) {
      return fail(400, { erreur: "Choix non reconnu." });
    }
    if (await enregistrerMonGout(locals.supabase, moi, tache, gout)) {
      return fail(500, {
        erreur: "Impossible d'enregistrer ton goût. Réessaie.",
      });
    }
  },
};
