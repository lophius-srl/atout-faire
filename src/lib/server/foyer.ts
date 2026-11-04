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
