# Atout faire

Les tâches de la maison sous forme de cartes : chacun pioche les siennes au marché, on se les échange,
et on retourne une carte quand la tâche est faite. Une PWA pour deux iPhone, sans frais.

## Démarrer
```bash
make install   # dépendances (pnpm)
make dev       # http://localhost:5173
make lint test build
```

## Stack
SvelteKit 5 (TypeScript) sur Vercel, Supabase pour la base et la connexion. Détails : [ADR 0002](docs/adr/0002-stack-et-hebergement.md).

## Installer sur iPhone
Ouvre l'URL de production dans Safari, puis Partager → « Sur l'écran d'accueil ».

## Comment on travaille
Voir [CLAUDE.md](CLAUDE.md) (règles du projet, sobriété GitHub) et [GUIDE.md](GUIDE.md) (outillage du dev-kit).
