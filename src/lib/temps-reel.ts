import { env } from "$env/dynamic/public";
import { createBrowserClient } from "@supabase/ssr";

/** Clé de dépendance des chargements qui lisent les cartes. */
export const DEPENDANCE_CARTES = "app:cartes";

/**
 * Écoute les changements des cartes du foyer et appelle `surChangement`.
 * La session est lue dans les cookies posés par le serveur ; les règles RLS filtrent ce qui est diffusé.
 * Renvoie la fonction qui arrête l'écoute.
 */
export function ecouterCartes(
  foyerId: string,
  surChangement: () => void,
): () => void {
  const url = env.PUBLIC_SUPABASE_URL;
  const cle = env.PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !cle) return () => {};
  const supabase = createBrowserClient(url, cle);
  const canal = supabase
    .channel(`cartes-${foyerId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "cartes",
        filter: `foyer_id=eq.${foyerId}`,
      },
      surChangement,
    )
    .subscribe();
  return () => {
    void supabase.removeChannel(canal);
  };
}
