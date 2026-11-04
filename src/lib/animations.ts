/** Durée d'une animation, ou 0 si l'utilisateur a demandé de réduire les animations. */
export function duree(ms: number): number {
  if (typeof window === "undefined") return ms;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : ms;
}
