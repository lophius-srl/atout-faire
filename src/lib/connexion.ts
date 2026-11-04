export function normaliserEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function emailValide(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/** Code à usage unique reçu par e-mail : des chiffres (6 par défaut chez Supabase). */
export function normaliserCodeConnexion(code: string): string {
  return code.replace(/\s/g, "");
}

export function codeConnexionValide(code: string): boolean {
  return /^\d{6,10}$/.test(code);
}

/** Code d'invitation du foyer : 6 caractères hexadécimaux, saisis en minuscules ou majuscules. */
export function normaliserCodeInvitation(code: string): string {
  return code.replace(/\s/g, "").toUpperCase();
}

export function codeInvitationValide(code: string): boolean {
  return /^[0-9A-F]{6}$/.test(code);
}

/** Écran vers lequel rediriger, ou null si l'utilisateur peut rester où il est. */
export function ecranRequis(etat: {
  connecte: boolean;
  aUnFoyer: boolean;
}): "/connexion" | "/foyer" | null {
  if (!etat.connecte) {
    return "/connexion";
  }
  return etat.aUnFoyer ? null : "/foyer";
}
