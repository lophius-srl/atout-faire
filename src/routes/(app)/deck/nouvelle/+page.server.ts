import { lireSaisieTache } from "$lib/deck";
import { MODELES, modelesDisponibles, trouverModele } from "$lib/modeles";
import { ajouterTache, listerParents, listerTaches } from "$lib/server/deck";
import { aujourdhuiDansMonFoyer } from "$lib/server/foyer";
import { aujourdhuiPourLeFoyer } from "$lib/server/cartes";
import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, url, parent }) => {
  const { foyer } = await parent();
  const moi = (await locals.utilisateurConnecte())?.id ?? "";
  const deck = await listerTaches(locals.supabase);
  return {
    parents: await listerParents(locals.supabase, moi),
    aujourdhui: aujourdhuiPourLeFoyer(foyer.fuseau),
    idees: modelesDisponibles(MODELES, deck),
    modele: trouverModele(url.searchParams.get("modele") ?? "") ?? null,
  };
};

export const actions: Actions = {
  enregistrer: async ({ request, locals }) => {
    const saisie = lireSaisieTache(
      await request.formData(),
      await aujourdhuiDansMonFoyer(locals.supabase),
    );
    if (!saisie.ok) return fail(400, { erreur: saisie.erreur });
    if (await ajouterTache(locals.supabase, saisie.tache)) {
      return fail(500, {
        erreur: "Impossible d'enregistrer la tâche. Réessaie.",
      });
    }
    redirect(303, "/deck");
  },
};
