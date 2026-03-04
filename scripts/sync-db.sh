#!/usr/bin/env bash
set -e

cd "$(dirname "$0")/.."

# Load env vars from .env
set -a
source .env
set +a

echo "==> Syncing local database to server..."

echo "==> Dumping local database..."
docker compose exec -T db pg_dump -U revenue --clean --if-exists revenue > /tmp/backup_full.sql
echo "    Done. ($(wc -l < /tmp/backup_full.sql) lines)"

echo "==> Uploading to server..."
scp -i "$REMOTE_KEY" /tmp/backup_full.sql "$REMOTE_USER@$REMOTE_HOST":~/

echo "==> Importing on server..."
ssh -i "$REMOTE_KEY" "$REMOTE_USER@$REMOTE_HOST" "cd ~/revenue && docker compose -f docker-compose.prod.yml exec -T db psql -U revenue -d revenue < ~/backup_full.sql" > /dev/null 2>&1

echo "==> Restarting server app..."
ssh -i "$REMOTE_KEY" "$REMOTE_USER@$REMOTE_HOST" "cd ~/revenue && docker compose -f docker-compose.prod.yml restart app"

echo ""
echo "============================================"
echo "  Database synced successfully!"
echo "  Server: http://${REMOTE_HOST}:3020"
echo "============================================"
