#!/bin/bash
set -e

# Write environment variables to .env file
printenv | grep -E "^(APP_|DB_|MAIL_|CACHE_|QUEUE_|SESSION_|FILESYSTEM_|VITE_)" > .env

# Ensure APP_URL uses HTTPS
if grep -q "APP_URL=" .env; then
  sed -i 's|^APP_URL=http://|APP_URL=https://|' .env
else
  echo "APP_URL=https://website-monitoring-webapp.onrender.com" >> .env
fi

# Run migrations and start server
php artisan migrate --force
php artisan serve --host=0.0.0.0 --port=8000
