#!/usr/bin/env bash
set -euo pipefail
APP_DIR="${APP_DIR:-/var/www/maskofhappiness}"
cd "$APP_DIR"
git fetch origin
git pull --ff-only origin main
npm install
npx prisma migrate deploy
npm run build
mkdir -p public/uploads
chown -R www-data:www-data public/uploads prisma
sudo systemctl restart maskofhappiness
if [ -d /etc/caddy/Caddyfile.d ]; then
  install -m 644 deploy/caddy-site.caddy /etc/caddy/Caddyfile.d/maskofhappiness.caddy
  systemctl reload caddy || true
fi
