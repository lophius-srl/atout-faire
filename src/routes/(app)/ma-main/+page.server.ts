import { poidsDesMains, semaineFinie } from "$lib/main";
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
  const moi = (await locals.utilisateurConnecte())?.id ?? "";
  const cartes = await listerCartesDeLaSemaine(
    locals.supabase,
    aujourdhuiPourLeFoyer(foyer.fuseau),
  );
  return {
    maMain: cartes.filter((c) => c.detenteur === moi).map((c) => c.carte),
    poids: poidsDesMains(cartes, moi),
    semaineFinie: semaineFinie(cartes.map((c) => c.carte)),
  };
};

export const actions: Actions = {
  retourner: async ({ request, locals }) => {
    const donnees = await request.formData();
    const carte = String(donnees.get("carte") ?? "");
    const faite = donnees.get("faite") !== "non";
    const { error } = await locals.supabase.rpc("retourner_carte", {
      carte,
      faite,
    });
    if (error) {
      return fail(403, {
        erreur: "Tu ne peux retourner que les cartes de ta main.",
      });
    }
  },

  remettreAuMarche: async ({ request, locals }) => {
    const carte = String((await request.formData()).get("carte") ?? "");
    const { error } = await locals.supabase.rpc("remettre_au_marche", {
      carte,
    });
    if (error) {
      return fail(403, {
        erreur:
          "Seules les cartes de ta main encore à faire peuvent repartir sur le Marché.",
      });
    }
    return { remise: true };
  },
};
