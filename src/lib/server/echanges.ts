import type { Echange, StatutEchange } from "$lib/echanges";
import type { SupabaseClient } from "@supabase/supabase-js";

interface LigneEchange {
  id: string;
  propose_par: string;
  carte_offerte: string;
  carte_contre: string | null;
  statut: StatutEchange;
}

/** Les échanges du foyer créés depuis `depuis` (RLS : seulement mon foyer). */
export async function listerEchanges(
  supabase: SupabaseClient,
  depuis: string,
): Promise<Echange[]> {
  const { data, error } = await supabase
    .from("echanges")
    .select("id, propose_par, carte_offerte, carte_contre, statut")
    .gte("cree_le", depuis)
    .order("cree_le", { ascending: false });
  if (error) throw error;
  return (data as LigneEchange[]).map((e) => ({
    id: e.id,
    proposePar: e.propose_par,
    carteOfferte: e.carte_offerte,
    carteContre: e.carte_contre,
    statut: e.statut,
  }));
}
