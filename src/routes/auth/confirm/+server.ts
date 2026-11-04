import { redirect } from "@sveltejs/kit";
import type { EmailOtpType } from "@supabase/supabase-js";
import type { RequestHandler } from "./$types";

/**
 * Lien reçu par e-mail. Deux formats possibles :
 * - `?code=` : modèle d'e-mail par défaut de Supabase (à ouvrir dans le navigateur qui a demandé l'e-mail) ;
 * - `?token_hash=&type=` : modèle personnalisé, valable depuis n'importe quel navigateur.
 */
export const GET: RequestHandler = async ({ url, locals }) => {
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;

  let error: unknown = true;
  if (code) {
    ({ error } = await locals.supabase.auth.exchangeCodeForSession(code));
  } else if (tokenHash && type) {
    ({ error } = await locals.supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    }));
  }
  redirect(303, error ? "/connexion?lien-invalide" : "/foyer");
};
