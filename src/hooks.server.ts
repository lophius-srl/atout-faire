import { creerClientSupabase } from "$lib/server/supabase";
import type { Handle } from "@sveltejs/kit";

export const handle: Handle = async ({ event, resolve }) => {
  const entetesAnticache: Record<string, string> = {};
  const supabase = creerClientSupabase(event, entetesAnticache);
  event.locals.supabase = supabase;

  // getClaims vérifie le jeton de session : on ne se fie jamais au seul cookie.
  // La vérification est faite une seule fois par requête, même si plusieurs chargements la demandent.
  let verification: Promise<{ id: string } | null> | undefined;
  event.locals.utilisateurConnecte = () =>
    (verification ??= supabase.auth
      .getClaims()
      .then(({ data }) => (data ? { id: data.claims.sub } : null)));

  const reponse = await resolve(event, {
    filterSerializedResponseHeaders: (nom) =>
      nom === "content-range" || nom === "x-supabase-api-version",
  });
  for (const [nom, valeur] of Object.entries(entetesAnticache)) {
    reponse.headers.set(nom, valeur);
  }
  return reponse;
};
