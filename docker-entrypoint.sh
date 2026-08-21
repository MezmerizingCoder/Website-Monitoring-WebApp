#!/bin/bash
set -e

# Write environment variables to .env file
printenv | grep -E "^(APP_|DB_|MAIL_|CACHE_|QUEUE_|SESSION_|FILESYSTEM_|VITE_)" > .env

# Force APP_URL to always use HTTPS
sed -i 's|APP_URL=http://|APP_URL=https://|g' .env
grep -q 'APP_URL=' .env || echo 'APP_URL=https://website-monitoring-webapp.onrender.com' >> .env

# Debug: show what APP_URL is set to
echo "--- APP_URL=$(grep APP_URL .env) ---"

# Run migrations and start server
php artisan migrate --force
php artisan serve --host=0.0.0.0 --port=8000
