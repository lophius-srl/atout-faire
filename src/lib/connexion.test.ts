import { describe, expect, it } from "vitest";
import {
  codeConnexionValide,
  codeInvitationValide,
  ecranRequis,
  emailValide,
  normaliserCodeConnexion,
  normaliserCodeInvitation,
  normaliserEmail,
} from "./connexion";

describe("e-mail", () => {
  it("est normalisé en minuscules, sans espaces autour", () => {
    expect(normaliserEmail("  Antoine@Exemple.FR ")).toBe("antoine@exemple.fr");
  });

  it("est validé simplement", () => {
    expect(emailValide("a@b.fr")).toBe(true);
    expect(emailValide("a@b")).toBe(false);
    expect(emailValide("pas un e-mail")).toBe(false);
  });
});

describe("code de connexion", () => {
  it("accepte des chiffres, même tapés avec des espaces", () => {
    expect(codeConnexionValide(normaliserCodeConnexion("123 456"))).toBe(true);
  });

  it("refuse un code trop court ou avec des lettres", () => {
    expect(codeConnexionValide("12345")).toBe(false);
    expect(codeConnexionValide("12a456")).toBe(false);
  });
});

describe("code d'invitation", () => {
  it("accepte les minuscules et les espaces", () => {
    const code = normaliserCodeInvitation(" ea3 9cf ");
    expect(code).toBe("EA39CF");
    expect(codeInvitationValide(code)).toBe(true);
  });

  it("refuse un code mal formé", () => {
    expect(codeInvitationValide("EA39")).toBe(false);
    expect(codeInvitationValide("ZZZZZZ")).toBe(false);
  });
});

describe("écran requis", () => {
  it("envoie vers la connexion si personne n'est connecté", () => {
    expect(ecranRequis({ connecte: false, aUnFoyer: false })).toBe(
      "/connexion",
    );
  });

  it("envoie vers le foyer si l'utilisateur n'en a pas encore", () => {
    expect(ecranRequis({ connecte: true, aUnFoyer: false })).toBe("/foyer");
  });

  it("laisse passer un utilisateur connecté qui a un foyer", () => {
    expect(ecranRequis({ connecte: true, aUnFoyer: true })).toBeNull();
  });
});
