import { dateDansFuseau, type DateLocale } from "$lib/distribution";
import type { Vacances } from "$lib/vacances";
import type { SupabaseClient } from "@supabase/supabase-js";

export interface MonFoyer {
  id: string;
  codeInvitation: string;
  nombreDeMembres: number;
  fuseau: string;
}

/** Le foyer de l'utilisateur connecté, ou null. Les règles RLS limitent la lecture à son foyer. */
export async function chercherMonFoyer(
  supabase: SupabaseClient,
): Promise<MonFoyer | null> {
  // Une seule requête : le foyer et le nombre de ses membres (relation membres.foyer_id).
  const { data: foyer, error } = await supabase
    .from("foyers")
    .select("id, code_invitation, fuseau, membres(count)")
    .maybeSingle();
  if (error) {
    throw error;
  }
  if (!foyer) {
    return null;
  }
  const [{ count } = { count: 1 }] = foyer.membres as { count: number }[];
  return {
    id: foyer.id,
    codeInvitation: foyer.code_invitation,
    nombreDeMembres: count,
    fuseau: foyer.fuseau,
  };
}

/** La date du jour pour le foyer de l'utilisateur (utile dans les actions, qui n'ont pas les données du layout). */
export async function aujourdhuiDansMonFoyer(
  supabase: SupabaseClient,
): Promise<DateLocale> {
  const foyer = await chercherMonFoyer(supabase);
  return dateDansFuseau(new Date(), foyer?.fuseau ?? "Europe/Paris");
}

/** Les périodes de vacances du foyer qui finissent à partir de `depuis`, dans l'ordre. */
export async function listerVacances(
  supabase: SupabaseClient,
  depuis: DateLocale,
): Promise<Vacances[]> {
  const { data, error } = await supabase
    .from("vacances")
    .select("debut, fin")
    .gte("fin", depuis)
    .order("debut");
  if (error) throw error;
  return data as Vacances[];
}
