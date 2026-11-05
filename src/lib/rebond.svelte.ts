/** Chaque nouvelle carte arrivée dans ma main fait rebondir l'onglet « Ma main ». */
export const arriveesDansLaMain = $state({ compte: 0 });

export function annoncerArriveeDansLaMain(): void {
  arriveesDansLaMain.compte += 1;
}
