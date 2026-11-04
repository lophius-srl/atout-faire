import { describe, expect, it } from "vitest";
import { messageApresAction } from "./retour";

describe("message après une action", () => {
  it("annonce le succès avec le message prévu", () => {
    expect(
      messageApresAction(
        { type: "success", status: 200 },
        "C'est dans ta main ✋",
      ),
    ).toEqual({
      texte: "C'est dans ta main ✋",
      type: "succes",
    });
  });

  it("annonce aussi le succès d'une action qui redirige", () => {
    expect(
      messageApresAction(
        { type: "redirect", status: 303, location: "/deck" },
        "Tâche enregistrée",
      ),
    ).toEqual({ texte: "Tâche enregistrée", type: "succes" });
  });

  it("ne dit rien quand aucun message de succès n'est prévu", () => {
    expect(messageApresAction({ type: "success", status: 200 })).toBeNull();
  });

  it("reprend l'erreur renvoyée par le serveur", () => {
    expect(
      messageApresAction(
        { type: "failure", status: 409, data: { erreur: "Trop tard." } },
        "ok",
      ),
    ).toEqual({ texte: "Trop tard.", type: "erreur" });
  });

  it("donne un message clair quand le serveur ne précise rien", () => {
    const resultat = messageApresAction({
      type: "error",
      status: 500,
      error: new Error("x"),
    });
    expect(resultat?.type).toBe("erreur");
    expect(resultat?.texte).toMatch(/Réessaie/);
  });
});
