# Point d'entrée unique pour toutes les commandes du projet.
# La CI lance `make install lint test build`.

.PHONY: install dev lint format test build deploy

install:
	npm ci

dev:
	npm run dev

lint:
	npm run lint
	npm run check

format:
	npm run format

test:
	npm test

build:
	npm run build

deploy:
	@echo "Déploiement géré par l'intégration Git de Vercel (production sur main, preview sur chaque PR)."
