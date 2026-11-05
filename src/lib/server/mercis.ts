import type { Merci } from "$lib/mercis";
import type { SupabaseClient } from "@supabase/supabase-js";

/** Mes mercis envoyés et reçus (RLS : jamais ceux des autres). */
export async function listerMercis(
  supabase: SupabaseClient,
  depuis: string,
): Promise<Merci[]> {
  const { data, error } = await supabase
    .from("mercis")
    .select("carte_id, de, pour, vu")
    .gte("cree_le", depuis);
  if (error) throw error;
  return data as Merci[];
}
