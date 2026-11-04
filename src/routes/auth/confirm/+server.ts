import { redirect } from "@sveltejs/kit";
import type { EmailOtpType } from "@supabase/supabase-js";
import type { RequestHandler } from "./$types";

/** Lien reçu par e-mail : valide le jeton puis ouvre la suite du parcours. */
export const GET: RequestHandler = async ({ url, locals }) => {
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;
  if (tokenHash && type) {
    const { error } = await locals.supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });
    if (!error) {
      redirect(303, "/foyer");
    }
  }
  redirect(303, "/connexion?lien-invalide");
};
