import { libelleEcheance } from "$lib/cartes";
import { lundiDeLaSemaine } from "$lib/distribution";
import {
  cartesEngagees,
  demandeUneCarte,
  estEnCours,
  reponsesPossibles,
  situationEchange,
  type Reponse,
} from "$lib/echanges";
import { poidsDesMains, semaineFinie } from "$lib/main";
import { listerEchanges } from "$lib/server/echanges";
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
  const aujourdhui = aujourdhuiPourLeFoyer(foyer.fuseau);
  const cartes = await listerCartesDeLaSemaine(locals.supabase, aujourdhui);
  const echanges = await listerEchanges(
    locals.supabase,
    lundiDeLaSemaine(aujourdhui),
  );

  const parId = new Map(cartes.map((c) => [c.carte.id, c.carte]));
  const resume = (id: string | null) => {
    const carte = id ? parId.get(id) : undefined;
    return carte
      ? {
          tache: carte.tache,
          categorie: carte.categorie,
          echeance: libelleEcheance(carte.echeance),
        }
      : null;
  };
  const engagees = cartesEngagees(echanges);
  const maMain = cartes.filter((c) => c.detenteur === moi).map((c) => c.carte);

  return {
    maMain,
    engagees: [...engagees],
    // Cartes que je peux donner en échange : dans ma main, à faire, pas déjà engagées.
    aDonner: maMain
      .filter((c) => !c.retournee && !engagees.has(c.id))
      .map((c) => ({
        id: c.id,
        libelle: `${c.tache} (${libelleEcheance(c.echeance)})`,
      })),
    echanges: echanges
      .filter((e, rang) => estEnCours(e.statut) || rang < 3)
      .map((e) => ({
        id: e.id,
        offerte: resume(e.carteOfferte),
        contre: resume(e.carteContre),
        situation: situationEchange(e, moi),
        reponses: reponsesPossibles(e, moi).map((reponse: Reponse) => ({
          reponse,
          demandeUneCarte: demandeUneCarte(reponse, e),
        })),
      }))
      .filter((e) => e.offerte),
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

  proposerEchange: async ({ request, locals }) => {
    const carte = String((await request.formData()).get("carte") ?? "");
    const { error } = await locals.supabase.rpc("proposer_echange", { carte });
    if (error) return fail(400, { erreur: error.message });
    return { echangePropose: true };
  },

  repondreEchange: async ({ request, locals }) => {
    const donnees = await request.formData();
    const { error } = await locals.supabase.rpc("repondre_echange", {
      echange: String(donnees.get("echange") ?? ""),
      reponse: String(donnees.get("reponse") ?? ""),
      ma_carte: String(donnees.get("maCarte") ?? "") || null,
    });
    if (error) return fail(400, { erreur: error.message });
  },
};
