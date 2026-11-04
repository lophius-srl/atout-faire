import {
  aujourdhuiPourLeFoyer,
  listerCartesDeLaSemaine,
} from "$lib/server/cartes";
import { poidsDesMains } from "$lib/main";
import { DEPENDANCE_CARTES } from "$lib/temps-reel";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, parent, depends }) => {
  depends(DEPENDANCE_CARTES);
  const { foyer } = await parent();
  const moi = (await locals.utilisateurConnecte())?.id ?? "";
  const cartes = await listerCartesDeLaSemaine(
    locals.supabase,
    aujourdhuiPourLeFoyer(foyer.fuseau),
  );
  return {
    maMain: cartes.filter((c) => c.detenteur === moi).map((c) => c.carte),
    poids: poidsDesMains(cartes, moi),
  };
};
