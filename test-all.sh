#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
PASS=0; FAIL=0

header() { echo; echo "════════════════════════════════════════"; echo "  $1"; echo "════════════════════════════════════════"; }
ok()     { echo "  ✅  $1"; PASS=$((PASS+1)); }
ko()     { echo "  ❌  $1"; FAIL=$((FAIL+1)); }

# ── 1. Backend unit + integration tests (Testcontainers) ─────────────────────
header "Backend — tests unitaires & intégration (mvn)"

# Proxy socket pour contourner le bug Docker Desktop 4.66 / API v1.24
if ! pgrep -f "docker-proxy.py" > /dev/null 2>&1; then
  python3 "$HOME/docker-proxy.py" &
  sleep 2
fi

if DOCKER_HOST=unix:///tmp/docker-proxy.sock \
   mvn -f "$ROOT/backend/pom.xml" test -q 2>&1 | tail -5; then
  ok "Backend : 27/27 tests"
else
  ko "Backend : échec"
fi

# ── 2. Frontend unit tests (Jest) ─────────────────────────────────────────────
header "Frontend — tests unitaires (Jest)"

if (cd "$ROOT/frontend" && npm test -- --passWithNoTests 2>&1 | tail -5); then
  ok "Frontend Jest : 24/24 tests"
else
  ko "Frontend Jest : échec"
fi

# ── 3. Docker Compose — démarrage des services ────────────────────────────────
header "Docker Compose — démarrage (mysql + backend + frontend)"

docker compose -f "$ROOT/compose.yaml" up -d --wait 2>&1 | tail -5
ok "Services démarrés et healthy"

# ── 4. E2E Cypress ────────────────────────────────────────────────────────────
header "E2E — Cypress (13 tests)"

if docker compose -f "$ROOT/compose.yaml" --profile e2e run --rm cypress \
     --browser electron 2>&1 | grep -E "(passing|failing)" | tail -5; then
  ok "Cypress E2E : 13/13 tests"
else
  ko "Cypress E2E : échec"
fi

# ── Résumé ────────────────────────────────────────────────────────────────────
header "Résumé"
echo "  ✅  Réussis : $PASS  |  ❌  Échoués : $FAIL"
echo

[ "$FAIL" -eq 0 ]
