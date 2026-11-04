# 0002 — Stack et hébergement

- **Date** : 2026-11-04
- **Statut** : accepté

## Contexte
Atout faire est une app pour deux personnes (un couple, deux iPhone) qui se répartissent les tâches
de la maison sous forme de cartes : on les pioche, on se les échange, on les retourne quand c'est fait.
Contraintes : coût nul, une seule personne pour maintenir, pas de Mac, synchronisation entre les deux téléphones.

## Options étudiées
1. **Cloudflare (Worker + D1), comme running-coach** : aucun compte à créer, pas de mise en veille,
   connexion via Cloudflare Access. Pas de temps réel natif : rafraîchissement régulier.
2. **SvelteKit + Supabase + Vercel** : base Postgres, authentification Google et temps réel fournis
   par Supabase, déploiement et previews de PR automatiques par Vercel. Deux comptes à créer, et le projet
   Supabase gratuit se met en pause après une semaine sans activité.

## Décision
Option 2 : une PWA **SvelteKit 5** (TypeScript) hébergée sur **Vercel** (Hobby), avec **Supabase** (Free)
pour la base, l'authentification et le temps réel.

## Conséquences
- PWA installable depuis Safari (« Ajouter à l'écran d'accueil »), notifications push possibles depuis iOS 16.4.
  Pas de widget d'écran d'accueil ni de Siri.
- Vercel est connecté directement au repo : production à chaque merge sur `main`, preview pour chaque PR.
  `deploy.yml` est donc supprimé. Le plan Hobby est réservé à un usage personnel et non commercial, ce qui est le cas.
- Supabase Free met un projet en pause s'il reçoit trop peu d'activité pendant une semaine (e-mail d'avertissement avant).
  Un usage quotidien suffit ; à surveiller pendant les vacances.
- La logique métier (génération des cartes du jour, échanges, calcul de la balance) reste dans `src/lib/`,
  en fonctions pures testées, indépendantes de Supabase.
- Versions : les outils communs avec running-coach sont épinglés ; les paquets Svelte utilisent des plages `^`
  jusqu'à la première installation, puis `pnpm-lock.yaml` fixe tout. Dependabot les tient à jour chaque mois.
