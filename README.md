# Atout faire

Les tâches de la maison, à piocher comme des cartes. Une app pour deux : chaque jour, les cartes arrivent sur
le Marché, chacun pioche depuis son téléphone, et une balance garde l'équilibre.
La semaine est finie quand toutes les cartes sont retournées.

**Stack** : SvelteKit · Supabase · Vercel (voir [ADR 0002](docs/adr/0002-stack-sveltekit-vercel-supabase.md)).

## Démarrer
```bash
cp .env.example .env   # puis remplis les clés Supabase
make install
make dev
```

| Action | Commande |
|---|---|
| Lint + vérification des types | `make lint` |
| Formater | `make format` |
| Tests | `make test` |
| Build | `make build` |

## Organisation
Le processus (issues, agents, PR, CI) est décrit dans [GUIDE.md](GUIDE.md) et [CLAUDE.md](CLAUDE.md).
