# CLAUDE.md — Règles du projet

## Le projet
- **Nom** : Atout faire
- **But** : répartir équitablement les tâches de la maison entre deux parents, sous forme de cartes
  qu'on pioche quand on veut, qu'on s'échange, et qu'on retourne une fois faites. Une carte par tâche et par jour.
  Le seul but est de finir les tâches : **pas de points, de récompenses ni de classement**.
- **Utilisateurs** : un couple, deux iPhone (PWA installée depuis Safari), interface en français.
- **Stack** : TypeScript, pnpm, **SvelteKit 5** (runes) + PWA, hébergé sur **Vercel** (Hobby),
  **Supabase** (Free) pour la base Postgres, la connexion et le temps réel. Tests **Vitest**, ESLint + Prettier (ADR 0002).
- **Décisions d'architecture** : voir `docs/adr/`

## Commandes (toujours passer par le Makefile)
| Action | Commande |
|---|---|
| Installer | `make install` |
| Lancer en local | `make dev` |
| Lint / format | `make lint` / `make format` |
| Tests | `make test` |
| Build | `make build` |

La CI exécute exactement `make lint test build`. Si ça passe en local, ça passe en CI.

## Interactions avec GitHub (sobriété, obligatoire)
Un compte GitHub peut être suspendu après une activité trop automatisée (c'est arrivé sur running-coach).
Pour rester un usage « humain » :
- **Local d'abord** : tout se vérifie avec `make lint test build` avant le premier push. Un push par étape
  (fin du dev, fin de la QA, corrections de review), jamais un push par commit.
- **Pas de PR brouillon pour faire tourner la CI** : la PR s'ouvre une seule fois, quand le travail est prêt.
- **Pas de surveillance en boucle** : interdit `gh pr checks --watch`, `gh run watch` et les boucles sur l'API.
  Vérifier la CI une seule fois, au moins 3 minutes après le push (`gh pr checks <n°>`), sinon laisser l'humain regarder.
- **Créations en petit nombre** : au plus 20 issues par session, une par une, avec ≥ 30 s entre deux créations.
  Pas de script de création en masse. Au-delà, préparer les fichiers et laisser l'humain les créer.
- **Pas de commentaire automatique** : les reviews et rapports se donnent dans le terminal. Poster sur GitHub
  (`gh pr comment`, `gh pr review`, `gh issue comment`) seulement si l'humain le demande, une fois.
- **Ne jamais écrire `@claude`, `@dependabot` ni `@<login>`** dans un texte publié (déclenche des workflows/notifications).
- **Lecture plutôt qu'écriture** : préférer `git` local (`git diff main...HEAD`, `git log`) à l'API GitHub quand c'est possible.
- Si GitHub répond 403/429 ou « suspended » : s'arrêter immédiatement et prévenir l'humain, sans réessayer.


## Méthode de travail (obligatoire)
1. **Une issue = une branche = une PR.** Branche : `feat/<n°-issue>-court-titre`, `fix/<n°>-...`, `chore/...`.
2. **Jamais de commit direct sur `main`.**
3. **Commits conventionnels** : `feat:`, `fix:`, `docs:`, `test:`, `refactor:`, `chore:`, `ci:`.
   `feat!:` ou `BREAKING CHANGE:` pour une rupture. (Le changelog et les versions en dépendent.)
4. **Petites PR** : viser moins de ~400 lignes modifiées. Sinon, découper l'issue.
5. Chaque PR contient `Closes #<n°>` pour que la carte avance seule dans GitHub Projects.
6. **Tests** : toute nouvelle logique a des tests. Un bug corrigé = un test qui le reproduit.
7. Avant d'ouvrir une PR : `make lint test build` doit passer.

## Conventions de code
- Noms explicites, fonctions courtes, pas de code mort ni de `console.log`/`print` de debug.
- Pas de secrets dans le code : variables d'environnement + `.env.example` tenu à jour.
- Toute décision technique structurante → un ADR dans `docs/adr/`.
- Structure :
  - `src/lib/` : logique métier pure (cartes du jour, marché, échanges, balance), sans I/O, testée unitairement
    à côté du code (`*.test.ts`).
  - `src/lib/server/` (à venir) : accès Supabase côté serveur.
  - `src/routes/` : pages SvelteKit (une page par écran : ma main, la table, le marché, le deck).
  - `src/service-worker.ts` : cache de l'app et, plus tard, notifications push.
  - `static/` : manifest PWA et icônes.
- TypeScript `strict` ; pas de `any` ; Svelte 5 avec les runes (`$state`, `$derived`, `$props`).
- Noms du domaine en français, comme dans l'app : `carte`, `main`, `marche`, `echange`, `balance`.
- UI pensée pour iPhone d'abord (largeur 375 px, zones tactiles d'au moins 44 px, `safe-area-inset`).
- Variables publiques préfixées `PUBLIC_` (SvelteKit) ; secrets dans `.env` local et dans les réglages Vercel.
- Dépendances : versions exactes une fois le lockfile en place, mises à jour via Dependabot.

## Équipe d'agents (`.claude/agents/`)
| Agent | Rôle | Quand l'appeler |
|---|---|---|
| `product-owner` | Découpe une idée en issues avec critères d'acceptation | Nouvelle fonctionnalité |
| `architect` | Choix techniques, ADR, structure | Démarrage, choix structurant |
| `developer` | Implémente une issue, ouvre la PR | Une issue prête (`status: ready`) |
| `qa` | Écrit/complète les tests, cherche les cas limites | Avant ou pendant la PR |
| `reviewer` | Relit une PR selon la checklist | PR ouverte |

Le **propriétaire humain** du repo reste le lead : il valide les issues, relit et merge les PR.
Un agent ne merge jamais une PR et ne modifie jamais la CI ni les règles de branche sans demande explicite.
