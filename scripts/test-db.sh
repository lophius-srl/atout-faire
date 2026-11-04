#!/usr/bin/env bash
# Teste les migrations Supabase sur un Postgres local jetable (Postgres 15 ou plus requis).
# Usage : make test-db
set -euo pipefail

PG_BIN=$(dirname "$(command -v pg_ctl || ls /usr/lib/postgresql/*/bin/pg_ctl | tail -1)")
DOSSIER=$(mktemp -d)
PORT=55432
lancer() { if [ "$(id -u)" = 0 ]; then su postgres -s /bin/bash -c "$*"; else bash -c "$*"; fi; }
arreter() { lancer "'$PG_BIN/pg_ctl' -D '$DOSSIER/data' stop -m fast" >/dev/null 2>&1 || true; rm -rf "$DOSSIER"; }
trap arreter EXIT

chmod 777 "$DOSSIER"
lancer "'$PG_BIN/initdb' -D '$DOSSIER/data' -U postgres -A trust >/dev/null"
lancer "'$PG_BIN/pg_ctl' -D '$DOSSIER/data' -o '-p $PORT -k $DOSSIER' -l '$DOSSIER/log' start -w >/dev/null"

psql_test() { psql -h "$DOSSIER" -p "$PORT" -U postgres -v ON_ERROR_STOP=1 -q "$@"; }

# Base modèle migrée, puis une copie neuve par fichier de test.
psql_test -c "create database modele"
psql_test -d modele -f supabase/tests/auth-simule.sql
for migration in supabase/migrations/*.sql; do psql_test -d modele -f "$migration"; done
for test in supabase/tests/*.test.sql; do
  base=$(basename "$test" .test.sql | tr -c 'a-z0-9\n' '_')
  psql_test -c "create database $base template modele"
  psql_test -d "$base" -o /dev/null -f "$test"
  echo "  ✓ $test"
done
echo "✅ Tests de la base : OK"
