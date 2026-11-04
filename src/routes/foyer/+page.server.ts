import { codeInvitationValide, normaliserCodeInvitation } from "$lib/connexion";
import { chercherMonFoyer } from "$lib/server/foyer";
import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
  if (!(await locals.utilisateurConnecte())) {
    redirect(303, "/connexion");
  }
  return { foyer: await chercherMonFoyer(locals.supabase) };
};

export const actions: Actions = {
  creer: async ({ locals }) => {
    const { error } = await locals.supabase.rpc("creer_foyer");
    if (error) {
      return fail(400, { erreur: error.message });
    }
  },

  rejoindre: async ({ request, locals }) => {
    const code = normaliserCodeInvitation(
      String((await request.formData()).get("code") ?? ""),
    );
    if (!codeInvitationValide(code)) {
      return fail(400, {
        code,
        erreur: "Ce code d'invitation n'est pas valide.",
      });
    }
    const { error } = await locals.supabase.rpc("rejoindre_foyer", { code });
    if (error) {
      return fail(400, { code, erreur: error.message });
    }
    redirect(303, "/marche");
  },
};
