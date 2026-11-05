import {
  dateDansFuseau,
  heureDansFuseau,
  lundiDeLaSemaine,
} from "$lib/distribution";
import { proposerCoupDeMain } from "$lib/balance";
import { poidsDesMains } from "$lib/main";
import { niveauAttente } from "$lib/marche";
import { listerCartesDeLaSemaine, semainesVaincues } from "$lib/server/cartes";
import { progressionDuFoyer } from "$lib/progression";
import { DEPENDANCE_CARTES } from "$lib/temps-reel";
import { fail } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, parent, depends }) => {
  depends(DEPENDANCE_CARTES);
  const { foyer } = await parent();
  const instant = new Date();
  const maintenant = {
    date: dateDansFuseau(instant, foyer.fuseau),
    heure: heureDansFuseau(instant, foyer.fuseau),
  };
  const [utilisateur, cartes, niveau] = await Promise.all([
    locals.utilisateurConnecte(),
    listerCartesDeLaSemaine(locals.supabase, maintenant.date),
    semainesVaincues(locals.supabase, lundiDeLaSemaine(maintenant.date)),
  ]);
  const poids = poidsDesMains(cartes, utilisateur?.id ?? "");
  const auMarche = cartes
    .filter((c) => c.detenteur === null && !c.carte.retournee)
    .map((c) => ({
      carte: c.carte,
      niveau: niveauAttente(
        { echeance: c.carte.echeance.type, dateEcheance: c.dateEcheance },
        maintenant,
      ),
    }));
  const progression = progressionDuFoyer(
    cartes.map((c) => ({
      retournee: c.carte.retournee,
      echeance: c.carte.echeance.type,
      dateEcheance: c.dateEcheance,
    })),
    maintenant.date,
  );
  return {
    progression,
    niveau,
    auMarche,
    coupDeMain: proposerCoupDeMain(poids.moi, poids.autre, auMarche.length),
  };
};

export const actions: Actions = {
  piocher: async ({ request, locals }) => {
    const carte = String((await request.formData()).get("carte") ?? "");
    const { error } = await locals.supabase.rpc("piocher_carte", { carte });
    if (error) {
      return fail(409, { erreur: "Trop tard : cette carte a déjà été prise." });
    }
    return { piochee: carte };
  },
};
