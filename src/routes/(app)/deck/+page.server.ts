import { MODELES, trouverModele } from "$lib/modeles";
import { ajouterTaches, listerParents, listerTaches } from "$lib/server/deck";
import { aujourdhuiPourLeFoyer } from "$lib/server/cartes";
import { fail } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, parent }) => {
  const moi = (await locals.utilisateurConnecte())?.id ?? "";
  const { foyer } = await parent();
  return {
    aujourdhui: aujourdhuiPourLeFoyer(foyer.fuseau),
    taches: await listerTaches(locals.supabase),
    parents: await listerParents(locals.supabase, moi),
    modeles: MODELES,
  };
};

export const actions: Actions = {
  ajouterModeles: async ({ request, locals }) => {
    const modeles = (await request.formData())
      .getAll("modele")
      .map((nom) => trouverModele(String(nom)))
      .filter((modele) => modele !== undefined);
    if (modeles.length === 0) {
      return fail(400, { erreur: "Coche au moins une tâche." });
    }
    if (
      await ajouterTaches(
        locals.supabase,
        modeles.map((m) => ({ ...m, fixePour: null })),
      )
    ) {
      return fail(500, {
        erreur: "Impossible d'ajouter ces tâches. Réessaie.",
      });
    }
  },
};
