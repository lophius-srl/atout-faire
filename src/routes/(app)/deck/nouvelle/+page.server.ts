import { lireSaisieTache } from "$lib/deck";
import { ajouterTache, listerParents } from "$lib/server/deck";
import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
  const moi = (await locals.utilisateurConnecte())?.id ?? "";
  return { parents: await listerParents(locals.supabase, moi) };
};

export const actions: Actions = {
  enregistrer: async ({ request, locals }) => {
    const saisie = lireSaisieTache(await request.formData());
    if (!saisie.ok) return fail(400, { erreur: saisie.erreur });
    if (await ajouterTache(locals.supabase, saisie.tache)) {
      return fail(500, {
        erreur: "Impossible d'enregistrer la tâche. Réessaie.",
      });
    }
    redirect(303, "/deck");
  },
};
