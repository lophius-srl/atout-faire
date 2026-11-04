import {
  aujourdhuiPourLeFoyer,
  listerCartesDeLaSemaine,
} from "$lib/server/cartes";
import { DEPENDANCE_CARTES } from "$lib/temps-reel";
import { fail } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, parent, depends }) => {
  depends(DEPENDANCE_CARTES);
  const { foyer } = await parent();
  const aujourdhui = aujourdhuiPourLeFoyer(foyer.fuseau);
  const cartes = await listerCartesDeLaSemaine(locals.supabase, aujourdhui);
  return {
    auMarche: cartes
      .filter((c) => c.detenteur === null && !c.carte.retournee)
      .map((c) => ({
        carte: c.carte,
        // Une carte d'un jour déjà passé attend toujours preneur.
        enAttente:
          c.carte.echeance.type === "jour" && c.dateEcheance < aujourdhui,
      })),
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
