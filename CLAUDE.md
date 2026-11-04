# CLAUDE.md — Règles du projet

> Ce fichier est lu automatiquement par Claude Code (en local et dans GitHub Actions).

## Le projet
- **Nom** : Atout faire
- **But** : répartir les tâches de la maison entre deux personnes, sous forme de cartes à piocher sur un « Marché » commun,
  avec une balance qui garde l'équilibre. Pensé pour un couple, sur téléphone.
- **Stack** : SvelteKit (Svelte 5, TypeScript) en web app installable (PWA), Supabase (Postgres, auth, temps réel),
  hébergé sur Vercel. Tests : Vitest. Qualité : ESLint, Prettier, svelte-check.
- **Règles du jeu et style** : document « Atout faire — règles et style » (Claude Docs).
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
- Svelte 5 en mode runes (`$state`, `$derived`, `$props`), TypeScript partout.
- Logique métier (balance, distribution des cartes, échanges…) en TypeScript pur dans `src/lib/`,
  testée avec Vitest (`*.spec.ts` à côté du fichier). Les composants restent minces.
- Structure : `src/routes/` (pages), `src/lib/components/` (composants), `src/lib/` (logique, client Supabase),
  `src/lib/illustrations/` (SVG des cartes), `supabase/migrations/` (schéma SQL).
- Accès aux données : toujours protégé par des règles RLS Supabase. Aucune clé `service_role` côté client.
- Interface en français. Style : couleurs pastel vives, une teinte par catégorie, coins arrondis.
- Node : version de `.nvmrc`, npm 11 ou plus récent.

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
