import { redirectionLienConnexion } from "$lib/connexion";
import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = ({ url }) => {
  const destination = redirectionLienConnexion(url.searchParams);
  if (destination) {
    redirect(303, destination);
  }
};
