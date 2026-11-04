import { env } from "$env/dynamic/public";
import { createServerClient } from "@supabase/ssr";
import type { RequestEvent } from "@sveltejs/kit";

/** Client Supabase propre à une requête : la session vit dans les cookies. */
export function creerClientSupabase(
  event: RequestEvent,
  entetesAnticache: Record<string, string>,
) {
  const url = env.PUBLIC_SUPABASE_URL;
  const cle = env.PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !cle) {
    throw new Error(
      "PUBLIC_SUPABASE_URL et PUBLIC_SUPABASE_PUBLISHABLE_KEY manquantes (voir .env.example).",
    );
  }
  return createServerClient(url, cle, {
    cookies: {
      getAll: () => event.cookies.getAll(),
      setAll: (cookies, entetes) => {
        for (const { name, value, options } of cookies) {
          event.cookies.set(name, value, { ...options, path: "/" });
        }
        // Une réponse qui pose une session ne doit jamais être mise en cache.
        Object.assign(entetesAnticache, entetes);
      },
    },
  });
}
