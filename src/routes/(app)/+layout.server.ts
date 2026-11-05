import { ecranRequis } from "$lib/connexion";
import { aujourdhuiPourLeFoyer, distribuerCartes } from "$lib/server/cartes";
import { chercherMonFoyer, listerVacances } from "$lib/server/foyer";
import { lundiDeLaSemaine } from "$lib/distribution";
import { DEPENDANCE_FOYER } from "$lib/temps-reel";
import { bandeauVacances, periodeActive } from "$lib/vacances";
import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals, depends }) => {
  depends(DEPENDANCE_FOYER);
  const utilisateur = await locals.utilisateurConnecte();
  const foyer = utilisateur ? await chercherMonFoyer(locals.supabase) : null;
  const ecran = ecranRequis({ connecte: !!utilisateur, aUnFoyer: !!foyer });
  if (ecran || !foyer) {
    redirect(303, ecran ?? "/foyer");
  }
  // Les cartes du jour arrivent quand quelqu'un ouvre l'app.
  const aujourdhui = aujourdhuiPourLeFoyer(foyer.fuseau);
  // Périodes qui touchent la semaine en cours ou plus tard (les jours déjà passés en vacances comptent).
  const vacances = await listerVacances(
    locals.supabase,
    lundiDeLaSemaine(aujourdhui),
  );
  const cartesPrevues = await distribuerCartes(
    locals.supabase,
    foyer.fuseau,
    vacances,
  );
  const enVue = periodeActive(vacances, aujourdhui);
  return {
    foyer,
    cartesPrevues,
    vacances: enVue,
    bandeauVacances: bandeauVacances(enVue, aujourdhui),
  };
};
