import { redirectionLienConnexion } from "$lib/connexion";
import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ url, locals }) => {
  const destination = redirectionLienConnexion(url.searchParams);
  if (destination) {
    redirect(303, destination);
  }
  // Déjà connecté : on ouvre directement l'app (le Marché redirige vers le foyer si besoin).
  if (await locals.utilisateurConnecte()) {
    redirect(303, "/marche");
  }
};
