import { souvenirs } from "$lib/batiments";
import { lundiDeLaSemaine } from "$lib/distribution";
import { recompensesVecues } from "$lib/recompenses";
import { aujourdhuiPourLeFoyer, lundisVaincus } from "$lib/server/cartes";
import { listerRecompenses } from "$lib/server/recompenses";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, parent }) => {
  const { foyer } = await parent();
  const lundi = lundiDeLaSemaine(aujourdhuiPourLeFoyer(foyer.fuseau));
  const [vaincues, recompenses] = await Promise.all([
    lundisVaincus(locals.supabase, lundi),
    listerRecompenses(locals.supabase),
  ]);
  const vecues = recompensesVecues(recompenses, foyer.fuseau);
  return {
    souvenirs: souvenirs(vaincues).map(({ lundi, niveau, batiment }) => ({
      lundi,
      niveau,
      batimentId: batiment.id,
      recompense: vecues.get(niveau) ?? null,
    })),
  };
};
