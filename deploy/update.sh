#!/usr/bin/env bash
set -euo pipefail
APP_DIR="${APP_DIR:-/var/www/maskofhappiness}"
cd "$APP_DIR"
git fetch origin
git pull --ff-only origin main
npm install
npx prisma migrate deploy
npm run build
sudo systemctl restart maskofhappiness
