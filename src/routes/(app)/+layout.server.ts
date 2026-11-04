import { ecranRequis } from "$lib/connexion";
import { chercherMonFoyer } from "$lib/server/foyer";
import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals }) => {
  const utilisateur = await locals.utilisateurConnecte();
  const foyer = utilisateur ? await chercherMonFoyer(locals.supabase) : null;
  const ecran = ecranRequis({ connecte: !!utilisateur, aUnFoyer: !!foyer });
  if (ecran) {
    redirect(303, ecran);
  }
  return { foyer };
};
