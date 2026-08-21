#!/bin/bash
set -e

# Write all env vars to .env
printenv | grep -E "^(APP_|DB_|MAIL_|CACHE_|QUEUE_|SESSION_|FILESYSTEM_|VITE_)" > .env

# Force HTTPS - remove old APP_URL line and add correct one
grep -v '^APP_URL=' .env > .env.tmp && mv .env.tmp .env
echo 'APP_URL=https://website-monitoring-webapp.onrender.com' >> .env

# Debug
echo "=== .env ==="
cat .env
echo "============"

# Run migrations and start server
php artisan migrate --force
php artisan serve --host=0.0.0.0 --port=8000
