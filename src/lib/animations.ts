/** Durée d'une animation, ou 0 si l'utilisateur a demandé de réduire les animations. */
export function duree(ms: number): number {
  if (typeof window === "undefined") return ms;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : ms;
}

interface Rectangle {
  left: number;
  top: number;
  width: number;
  height: number;
}

/**
 * Le trajet d'un élément vers une cible (ex. la carte piochée vers l'onglet « Ma main ») :
 * déplacement de centre à centre, et échelle pour arriver à peu près à la taille de la cible.
 */
export function trajetVersCible(
  depart: Rectangle,
  cible: Rectangle,
): { dx: number; dy: number; echelle: number } {
  const centre = (r: Rectangle) => ({
    x: r.left + r.width / 2,
    y: r.top + r.height / 2,
  });
  const a = centre(depart);
  const b = centre(cible);
  const echelle = Math.min(1, Math.max(0.1, cible.height / depart.height));
  return { dx: b.x - a.x, dy: b.y - a.y, echelle };
}
