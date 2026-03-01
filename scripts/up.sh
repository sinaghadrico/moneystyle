#!/usr/bin/env bash
set -e

cd "$(dirname "$0")/.."

echo "==> Starting database..."
docker compose up db -d

echo "==> Waiting for database to be healthy..."
until docker compose exec db pg_isready -U revenue -q 2>/dev/null; do
  sleep 1
done
echo "    Database ready."

echo "==> Running migrations..."
npx prisma migrate deploy

echo "==> Starting dev server on port 3020..."
PORT=3020 pnpm dev &
DEV_PID=$!

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
echo "  Local:  http://localhost:3020"
[ -n "$TUNNEL_URL" ] && echo "  Public: $TUNNEL_URL"
echo "============================================"
echo ""
echo "Press Ctrl+C to stop everything."

trap "echo '==> Shutting down...'; kill $DEV_PID $TUNNEL_PID 2>/dev/null; docker compose stop db; echo 'Done.'; exit 0" INT TERM

wait
