#!/usr/bin/env bash
# Run on the Vultr Ubuntu box as root.
# Usage: bash deploy/first-install.sh
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/maskofhappiness}"
REPO="${REPO:-https://github.com/anthev-stack/maskofhappiness.git}"

export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get install -y git curl ca-certificates

if ! command -v node >/dev/null 2>&1; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi

mkdir -p "$APP_DIR"
if [ ! -d "$APP_DIR/.git" ]; then
  git -c "safe.directory=$APP_DIR" clone "$REPO" "$APP_DIR"
else
  git -c "safe.directory=$APP_DIR" -C "$APP_DIR" fetch origin
  git -c "safe.directory=$APP_DIR" -C "$APP_DIR" checkout main
  git -c "safe.directory=$APP_DIR" -C "$APP_DIR" pull --ff-only origin main
fi

cd "$APP_DIR"

if [ ! -f .env ]; then
  cp .env.example .env
  SECRET="$(openssl rand -base64 32)"
  sed -i "s|^DATABASE_URL=.*|DATABASE_URL=\"file:./prod.db\"|" .env
  sed -i "s|^NEXTAUTH_URL=.*|NEXTAUTH_URL=\"https://maskofhappiness.com\"|" .env
  sed -i "s|^NEXTAUTH_SECRET=.*|NEXTAUTH_SECRET=\"$SECRET\"|" .env
  echo "Wrote $APP_DIR/.env — change ADMIN_PASSWORD before seeding if this is a public server."
fi

npm install
npx prisma migrate deploy
if [ ! -f prisma/.seeded ]; then
  npm run db:seed
  touch prisma/.seeded
fi
npm run build

install -m 644 deploy/maskofhappiness.service /etc/systemd/system/maskofhappiness.service
if [ -d /etc/caddy/Caddyfile.d ]; then
  install -m 644 deploy/caddy-site.caddy /etc/caddy/Caddyfile.d/maskofhappiness.caddy
fi
mkdir -p "$APP_DIR/public/uploads"
chown -R www-data:www-data "$APP_DIR/public/uploads" "$APP_DIR/prisma"
systemctl daemon-reload
systemctl enable --now maskofhappiness
systemctl restart maskofhappiness
if [ -d /etc/caddy/Caddyfile.d ]; then
  systemctl reload caddy || true
fi

echo
echo "App is on 127.0.0.1:3005. Caddy site file: /etc/caddy/Caddyfile.d/maskofhappiness.caddy"
echo "Caddy will issue HTTPS for maskofhappiness.com once DNS points here."
