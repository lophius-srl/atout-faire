import { listerParents, listerTaches } from "$lib/server/deck";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
  const moi = (await locals.utilisateurConnecte())?.id ?? "";
  return {
    taches: await listerTaches(locals.supabase),
    parents: await listerParents(locals.supabase, moi),
  };
};
