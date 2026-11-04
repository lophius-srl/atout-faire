# 0002 — Stack : SvelteKit, Vercel et Supabase

- **Date** : 2026-11-04
- **Statut** : accepté

## Contexte
Atout faire est une app pour un couple : les tâches de la maison deviennent des cartes qu'on pioche
sur un « Marché » commun, avec une balance qui garde l'équilibre (voir le document « Atout faire — règles et style »).
Contraintes :
- deux téléphones doivent voir le même Marché, à jour en temps réel ;
- des rappels doux à heure choisie (notifications) ;
- un style très visuel (cartes pastel, illustrations SVG) ;
- hébergement gratuit, maintenance par une seule personne.

## Options étudiées
1. **SvelteKit + Vercel + Supabase** : une web app installable (PWA), rien à publier sur un store.
   Supabase fournit la base Postgres, les comptes et le temps réel. Vercel déploie chaque merge et
   donne une URL de preview par PR. Peu de code, SVG et animations naturels en Svelte.
   Inconvénient : sur iPhone, les notifications web ne marchent qu'une fois l'app ajoutée à l'écran d'accueil.
2. **Flutter + Firebase** : vraie app mobile, notifications natives.
   Inconvénients : publication sur les stores (compte Apple payant), cycle de mise à jour plus lourd, pas de preview par PR.

## Décision
SvelteKit (TypeScript, Svelte 5) hébergé sur Vercel, avec Supabase pour les données, l'authentification et le temps réel.

## Conséquences
- **Déploiement** : intégration Git de Vercel (production sur `main`, preview sur chaque PR). Pas de workflow `deploy.yml`.
- **Outils** : npm, Vite, Vitest (tests unitaires), ESLint, Prettier, `svelte-check`. Node fixé par `.nvmrc`.
- **Données** : la sécurité repose sur les règles RLS de Supabase (la clé publique est visible dans le navigateur).
  Le schéma vit dans `supabase/migrations/` (CLI Supabase), versionné avec le code.
- **PWA** : manifeste et service worker à ajouter, nécessaires à l'installation et aux notifications.
- **À surveiller** : le projet Supabase gratuit se met en pause après une semaine sans activité,
  et les limites des offres gratuites (Vercel Hobby, Supabase Free) changent régulièrement.
