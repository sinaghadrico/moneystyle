#!/usr/bin/env bash
set -e

cd "$(dirname "$0")/.."

echo "==> Stopping dev server..."
pkill -f "next dev" 2>/dev/null && echo "    Stopped." || echo "    Not running."

echo "==> Stopping Cloudflare tunnel..."
pkill -f "cloudflared" 2>/dev/null && echo "    Stopped." || echo "    Not running."

echo "==> Removing Telegram webhook..."
npx tsx scripts/setup-telegram-webhook.ts --delete 2>/dev/null || true

echo "==> Stopping Docker containers..."
docker compose down

echo ""
echo "Everything stopped."
