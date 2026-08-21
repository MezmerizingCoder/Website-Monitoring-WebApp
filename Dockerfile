FROM php:8.4-cli

# Install system dependencies in a single layer
RUN apt-get update && apt-get install -y --no-install-recommends \
    git curl zip unzip libpng-dev libonig-dev libxml2-dev \
    libzip-dev libicu-dev libpq-dev nodejs npm \
    && docker-php-ext-install pdo pdo_mysql pgsql pdo_pgsql mbstring exif pcntl bcmath zip intl gd \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Copy full application first
COPY . .

# Create minimal .env for build-time artisan commands
RUN echo "APP_KEY=" > .env
RUN echo "APP_URL=https://website-monitoring-webapp.onrender.com" >> .env
RUN echo "APP_ENV=production" >> .env

# Install PHP dependencies (skip scripts, artisan needs .env)
RUN composer install --no-dev --optimize-autoloader --no-interaction --no-scripts

# Generate optimized autoload and discover packages
RUN composer dump-autoload --optimize
RUN php artisan package:discover --ansi

# Install Node dependencies and build frontend
RUN npm ci && npm run build

# Set permissions
RUN chmod +x docker-entrypoint.sh \
    && chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html/storage \
    && chmod -R 755 /var/www/html/bootstrap/cache

ENV APP_URL=https://website-monitoring-webapp.onrender.com
ENV APP_ENV=production

EXPOSE 8000

ENTRYPOINT ["./docker-entrypoint.sh"]
