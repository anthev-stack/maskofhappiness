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
  git clone "$REPO" "$APP_DIR"
else
  git -C "$APP_DIR" fetch origin
  git -C "$APP_DIR" checkout main
  git -C "$APP_DIR" pull --ff-only origin main
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
if [ ! -f prisma/prod.db ]; then
  npm run db:seed
fi
npm run build

install -m 644 deploy/maskofhappiness.service /etc/systemd/system/maskofhappiness.service
chown -R www-data:www-data "$APP_DIR"
systemctl daemon-reload
systemctl enable --now maskofhappiness

echo
echo "App is on 127.0.0.1:3002. Do not use nginx or certbot --nginx on this box if Caddy already owns port 80."
echo "Add deploy/caddy-site.caddy to your Caddyfile (or import it), then:"
echo "  systemctl reload caddy"
echo "Caddy will issue HTTPS for maskofhappiness.com once DNS points here."
