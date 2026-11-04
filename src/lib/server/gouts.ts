import { GOUT_PAR_DEFAUT, type Gout } from "$lib/gouts";
import type { SupabaseClient } from "@supabase/supabase-js";

/** Mes goûts, par identifiant de tâche. Les règles RLS ne renvoient que les miens. */
export async function listerMesGouts(
  supabase: SupabaseClient,
): Promise<Record<string, Gout>> {
  const { data, error } = await supabase.from("gouts").select("tache_id, gout");
  if (error) throw error;
  return Object.fromEntries(
    data.map(({ tache_id, gout }) => [tache_id, gout as Gout]),
  );
}

/** « Neutre » est la valeur par défaut : on supprime la ligne plutôt que de la stocker. */
export async function enregistrerMonGout(
  supabase: SupabaseClient,
  moi: string,
  tacheId: string,
  gout: Gout,
) {
  const requete =
    gout === GOUT_PAR_DEFAUT
      ? supabase
          .from("gouts")
          .delete()
          .eq("user_id", moi)
          .eq("tache_id", tacheId)
      : supabase
          .from("gouts")
          .upsert({ user_id: moi, tache_id: tacheId, gout });
  const { error } = await requete;
  return error;
}
