#!/usr/bin/env bash
set -e

cd "$(dirname "$0")/.."

# Load env vars from .env
set -a
source .env
set +a

echo "==> Deploying to ${REMOTE_HOST}..."

echo "==> Pulling latest code..."
ssh -i "$REMOTE_KEY" "$REMOTE_USER@$REMOTE_HOST" "cd ~/revenue && git pull"

echo "==> Restarting containers..."
ssh -i "$REMOTE_KEY" "$REMOTE_USER@$REMOTE_HOST" "cd ~/revenue && docker compose -f docker-compose.prod.yml up -d"

echo ""
echo "============================================"
echo "  Deployed successfully!"
echo "  Server: http://${REMOTE_HOST}:3020"
echo "============================================"
