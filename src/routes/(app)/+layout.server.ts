import { ecranRequis } from "$lib/connexion";
import { distribuerCartes } from "$lib/server/cartes";
import { chercherMonFoyer } from "$lib/server/foyer";
import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals }) => {
  const utilisateur = await locals.utilisateurConnecte();
  const foyer = utilisateur ? await chercherMonFoyer(locals.supabase) : null;
  const ecran = ecranRequis({ connecte: !!utilisateur, aUnFoyer: !!foyer });
  if (ecran || !foyer) {
    redirect(303, ecran ?? "/foyer");
  }
  // Les cartes du jour arrivent quand quelqu'un ouvre l'app.
  await distribuerCartes(locals.supabase, foyer.fuseau);
  return { foyer };
};
