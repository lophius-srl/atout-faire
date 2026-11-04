# 0003 — Connexion par e-mail et foyer à deux

- **Date** : 2026-11-04
- **Statut** : accepté

## Contexte
Deux parents doivent se connecter sur leurs iPhone et partager les mêmes données, sans que personne d'autre y accède.
L'app est une PWA installée sur l'écran d'accueil : sur iOS, elle ne partage pas ses cookies avec Safari.

## Options étudiées
1. **Lien magique seul** : simple, mais le lien s'ouvre dans Safari, et la session n'arrive pas dans la PWA installée.
2. **Lien + code à usage unique dans le même e-mail** : le code se tape dans la PWA (fiable sur iPhone), le lien reste pratique ailleurs.
3. **Compte Google** : fluide, mais demande une configuration Google Cloud.

## Décision
Option 2, avec Supabase Auth. La session vit dans des cookies gérés côté serveur (`@supabase/ssr`, `src/hooks.server.ts`).
Le jeton est vérifié à chaque requête avec `getClaims()`.
Les foyers (`foyers`, `membres`) sont protégés par RLS : chacun ne lit que son foyer, et les écritures passent
uniquement par les fonctions `creer_foyer()` et `rejoindre_foyer(code)`, qui imposent deux membres au plus.

## Conséquences
- Avec le modèle d'e-mail par défaut de Supabase, seul le lien est envoyé (`/auth/confirm?code=`) : il doit s'ouvrir
  dans le navigateur qui a demandé l'e-mail. Ajouter le code (`{{ .Token }}`) au modèle exige un SMTP personnalisé.
- Les migrations SQL sont dans `supabase/migrations/` et testées localement par `make test-db` (Postgres jetable, schéma `auth` simulé).
  Elles s'appliquent pour l'instant à la main dans l'éditeur SQL de Supabase.
- L'envoi d'e-mails par défaut de Supabase est limité à quelques messages par heure : suffisant pour deux personnes.
- Sans `PUBLIC_SUPABASE_URL` et `PUBLIC_SUPABASE_PUBLISHABLE_KEY`, le serveur refuse de démarrer les pages.
