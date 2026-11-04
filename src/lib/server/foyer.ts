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
  const { data: foyer, error } = await supabase
    .from("foyers")
    .select("id, code_invitation, fuseau")
    .maybeSingle();
  if (error) {
    throw error;
  }
  if (!foyer) {
    return null;
  }
  const { count } = await supabase
    .from("membres")
    .select("user_id", { count: "exact", head: true })
    .eq("foyer_id", foyer.id);
  return {
    id: foyer.id,
    codeInvitation: foyer.code_invitation,
    nombreDeMembres: count ?? 1,
    fuseau: foyer.fuseau,
  };
}
