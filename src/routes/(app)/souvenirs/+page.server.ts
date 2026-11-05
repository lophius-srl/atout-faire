import { souvenirs } from "$lib/batiments";
import { lundiDeLaSemaine } from "$lib/distribution";
import { aujourdhuiPourLeFoyer, lundisVaincus } from "$lib/server/cartes";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, parent }) => {
  const { foyer } = await parent();
  const lundi = lundiDeLaSemaine(aujourdhuiPourLeFoyer(foyer.fuseau));
  const vaincues = await lundisVaincus(locals.supabase, lundi);
  return {
    souvenirs: souvenirs(vaincues).map(({ lundi, niveau, batiment }) => ({
      lundi,
      niveau,
      batimentId: batiment.id,
    })),
  };
};
