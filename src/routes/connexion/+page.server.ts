import {
  codeConnexionValide,
  emailValide,
  normaliserCodeConnexion,
  normaliserEmail,
} from "$lib/connexion";
import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, url }) => {
  if (await locals.utilisateurConnecte()) {
    redirect(303, "/foyer");
  }
  return { lienInvalide: url.searchParams.has("lien-invalide") };
};

export const actions: Actions = {
  envoyer: async ({ request, locals, url }) => {
    const email = normaliserEmail(
      String((await request.formData()).get("email") ?? ""),
    );
    if (!emailValide(email)) {
      return fail(400, {
        email,
        erreur: "Cette adresse e-mail ne semble pas valide.",
      });
    }
    const { error } = await locals.supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${url.origin}/auth/confirm` },
    });
    if (error) {
      return fail(503, {
        email,
        erreur:
          "Impossible d'envoyer l'e-mail pour l'instant. Réessaie dans quelques minutes.",
      });
    }
    return { email, codeEnvoye: true };
  },

  verifier: async ({ request, locals }) => {
    const donnees = await request.formData();
    const email = normaliserEmail(String(donnees.get("email") ?? ""));
    const code = normaliserCodeConnexion(String(donnees.get("code") ?? ""));
    const erreur = "Ce code est incorrect ou a expiré.";
    if (!emailValide(email) || !codeConnexionValide(code)) {
      return fail(400, { email, codeEnvoye: true, erreur });
    }
    const { error } = await locals.supabase.auth.verifyOtp({
      email,
      token: code,
      type: "email",
    });
    if (error) {
      return fail(400, { email, codeEnvoye: true, erreur });
    }
    redirect(303, "/foyer");
  },
};
