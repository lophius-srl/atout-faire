# Point d'entrée unique pour toutes les commandes du projet.
# La CI lance `make install lint test build`.
# Stack : TypeScript, SvelteKit (PWA) sur Vercel, Supabase (voir docs/adr/0002).

.PHONY: install dev lint format test test-db build

# Lockfile figé dès qu'il est versionné ; sans lockfile (premier kickoff), pnpm le crée.
install:
	pnpm install $(if $(wildcard pnpm-lock.yaml),--frozen-lockfile,--no-frozen-lockfile)

dev:
	pnpm run dev

lint:
	pnpm run lint

format:
	pnpm run format

test:
	pnpm run test

# Tests des règles de sécurité de la base, sur un Postgres local jetable (Postgres 15+ requis).
test-db:
	./scripts/test-db.sh

build:
	pnpm run build
