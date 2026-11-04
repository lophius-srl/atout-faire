import { lireSaisieTache } from "$lib/deck";
import {
  listerParents,
  modifierTache,
  supprimerTache,
  trouverTache,
} from "$lib/server/deck";
import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, params }) => {
  const tache = await trouverTache(locals.supabase, params.id);
  // Tâche supprimée (par moi ou par l'autre parent) : on revient au deck plutôt qu'une page d'erreur.
  if (!tache) redirect(303, "/deck");
  const moi = (await locals.utilisateurConnecte())?.id ?? "";
  return { tache, parents: await listerParents(locals.supabase, moi) };
};

export const actions: Actions = {
  enregistrer: async ({ request, locals, params }) => {
    const saisie = lireSaisieTache(await request.formData());
    if (!saisie.ok) return fail(400, { erreur: saisie.erreur });
    if (await modifierTache(locals.supabase, params.id, saisie.tache)) {
      return fail(500, {
        erreur: "Impossible d'enregistrer la tâche. Réessaie.",
      });
    }
    redirect(303, "/deck");
  },

  supprimer: async ({ locals, params }) => {
    if (await supprimerTache(locals.supabase, params.id)) {
      return fail(500, {
        erreur: "Impossible de supprimer la tâche. Réessaie.",
      });
    }
    redirect(303, "/deck");
  },
};
