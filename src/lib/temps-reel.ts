import { env } from "$env/dynamic/public";
import { createBrowserClient } from "@supabase/ssr";

/** Clé de dépendance des chargements qui lisent les cartes. */
export const DEPENDANCE_CARTES = "app:cartes";

/**
 * Écoute les changements des cartes, des échanges et des mercis du foyer et appelle `surChangement`.
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
  const filtre = `foyer_id=eq.${foyerId}`;
  const canal = supabase
    .channel(`foyer-${foyerId}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "cartes", filter: filtre },
      surChangement,
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "echanges", filter: filtre },
      surChangement,
    )

    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "mercis", filter: filtre },
      surChangement,
    )

    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "recompenses", filter: filtre },
      surChangement,
    )
    .subscribe();
  return () => {
    void supabase.removeChannel(canal);
  };
}
