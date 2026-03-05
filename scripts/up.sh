#!/usr/bin/env bash
set -e

cd "$(dirname "$0")/.."

# Load env vars from .env
set -a
source .env
set +a

MODE="${1:---local}"

# Always start clean
rm -rf .next

if [ "$MODE" = "--remote" ]; then
  echo "==> Mode: REMOTE (server database)"
  echo "==> Starting SSH tunnel to ${REMOTE_HOST}..."
  ssh -i "$REMOTE_KEY" -L 5433:localhost:5432 "$REMOTE_USER@$REMOTE_HOST" -N -f 2>/dev/null
  echo "    SSH tunnel ready (localhost:5433)"

  # Backup .env and swap DATABASE_URL
  cp .env .env.backup
  sed -i '' 's|^DATABASE_URL=.*|DATABASE_URL="postgresql://revenue:'"${REMOTE_DB_PASSWORD}"'@localhost:5433/revenue"|' .env
  sed -i '' 's|^DIRECT_URL=.*|DIRECT_URL="postgresql://revenue:'"${REMOTE_DB_PASSWORD}"'@localhost:5433/revenue"|' .env
  echo "    .env switched to REMOTE database"

  # Re-export new DATABASE_URL so pnpm dev inherits it
  export DATABASE_URL="postgresql://revenue:${REMOTE_DB_PASSWORD}@localhost:5433/revenue"
  export DIRECT_URL="postgresql://revenue:${REMOTE_DB_PASSWORD}@localhost:5433/revenue"

  echo "==> Starting dev server on port 3020..."
  PORT=3020 pnpm dev &
  DEV_PID=$!

else
  echo "==> Mode: LOCAL (local database)"

  # Restore .env if backup exists (from previous remote session)
  [ -f .env.backup ] && cp .env.backup .env && rm .env.backup

  echo "==> Starting database + MinIO..."
  docker compose up db minio -d

  echo "==> Waiting for database to be healthy..."
  until docker compose exec db pg_isready -U revenue -q 2>/dev/null; do
    sleep 1
  done
  echo "    Database ready."

  echo "==> Initializing MinIO bucket..."
  docker compose up minio-init --wait 2>/dev/null || docker compose run --rm minio-init
  echo "    MinIO ready (console at http://localhost:9001)"

  echo "==> Syncing database schema..."
  npx prisma db push

  echo "==> Starting dev server on port 3020..."
  PORT=3020 pnpm dev &
  DEV_PID=$!
fi

# Wait for server
echo "==> Waiting for server..."
until curl -s -o /dev/null http://localhost:3020 2>/dev/null; do
  sleep 1
done
echo "    Server ready at http://localhost:3020"

# Find or install cloudflared
if command -v cloudflared &>/dev/null; then
  CLOUDFLARED=cloudflared
elif [ -x /tmp/cloudflared ]; then
  CLOUDFLARED=/tmp/cloudflared
else
  echo "==> Installing cloudflared..."
  ARCH=$(uname -m)
  if [ "$ARCH" = "arm64" ]; then
    CF_ARCH="darwin-arm64"
  else
    CF_ARCH="darwin-amd64"
  fi
  curl -sL "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-${CF_ARCH}.tgz" -o /tmp/cloudflared.tgz
  tar -xzf /tmp/cloudflared.tgz -C /tmp/
  chmod +x /tmp/cloudflared
  CLOUDFLARED=/tmp/cloudflared
fi

echo "==> Starting Cloudflare tunnel..."
$CLOUDFLARED tunnel --url http://localhost:3020 2>&1 | tee /tmp/revenue-tunnel.log &
TUNNEL_PID=$!

# Wait for tunnel URL to appear in logs
echo "    Waiting for tunnel URL..."
for i in $(seq 1 30); do
  TUNNEL_URL=$(grep -oE 'https://[a-zA-Z0-9-]+\.trycloudflare\.com' /tmp/revenue-tunnel.log 2>/dev/null | head -1)
  [ -n "$TUNNEL_URL" ] && break
  sleep 1
done

if [ -z "$TUNNEL_URL" ]; then
  echo "    WARNING: Could not detect tunnel URL. Set webhook manually."
else
  echo "    Tunnel ready at $TUNNEL_URL"

  # Wait for tunnel to be reachable (DNS propagation)
  echo "    Waiting for tunnel to be reachable..."
  for i in $(seq 1 20); do
    if curl -s -o /dev/null -w "%{http_code}" "$TUNNEL_URL" 2>/dev/null | grep -qE '(200|404)'; then
      break
    fi
    sleep 2
  done

  echo "==> Setting Telegram webhook..."
  npx tsx scripts/setup-telegram-webhook.ts "$TUNNEL_URL/api/telegram" || echo "    Webhook setup failed. Retry manually."
fi

echo ""
echo "============================================"
echo "  Revenue is running!"
echo "  Mode:   $([ "$MODE" = "--remote" ] && echo "REMOTE" || echo "LOCAL")"
echo "  Local:  http://localhost:3020"
[ -n "$TUNNEL_URL" ] && echo "  Public: $TUNNEL_URL"
echo "============================================"
echo ""
echo "Press Ctrl+C to stop everything."

cleanup() {
  echo '==> Shutting down...'
  kill $DEV_PID $TUNNEL_PID 2>/dev/null
  if [ "$MODE" = "--remote" ]; then
    pkill -f "ssh.*5433:localhost:5432" 2>/dev/null
    # Restore original .env
    [ -f .env.backup ] && cp .env.backup .env && rm .env.backup
    echo "    SSH tunnel closed. .env restored to LOCAL."
  else
    docker compose stop db minio
  fi
  rm -f .env.local
  echo 'Done.'
  exit 0
}

trap cleanup INT TERM
wait
