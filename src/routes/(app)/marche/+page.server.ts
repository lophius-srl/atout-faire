import {
  aujourdhuiPourLeFoyer,
  listerCartesDeLaSemaine,
} from "$lib/server/cartes";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, parent }) => {
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
