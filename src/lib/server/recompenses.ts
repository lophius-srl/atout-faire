import type { Recompense } from "$lib/recompenses";
import type { SupabaseClient } from "@supabase/supabase-js";

interface LigneRecompense {
  id: string;
  niveau: number;
  description: string;
  proposee_par: string;
  acceptee: boolean;
  profitee: boolean;
  profitee_le: string | null;
}

/** Les récompenses du foyer, par boss (RLS : seulement mon foyer). */
export async function listerRecompenses(
  supabase: SupabaseClient,
): Promise<Recompense[]> {
  const { data, error } = await supabase
    .from("recompenses")
    .select(
      "id, niveau, description, proposee_par, acceptee, profitee, profitee_le",
    )
    .order("niveau");
  if (error) throw error;
  return (data as LigneRecompense[]).map(
    ({ proposee_par, profitee_le, ...reste }) => ({
      ...reste,
      proposeePar: proposee_par,
      profiteeLe: profitee_le,
    }),
  );
}
