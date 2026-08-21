#!/bin/bash
set -e

# Write environment variables to .env file
printenv | grep -E "^(APP_|DB_|MAIL_|CACHE_|QUEUE_|SESSION_|FILESYSTEM_)" > .env

# Run migrations and start server
php artisan migrate --force
php artisan serve --host=0.0.0.0 --port=8000
