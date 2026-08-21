FROM php:8.2-cli

# Install system dependencies in a single layer
RUN apt-get update && apt-get install -y --no-install-recommends \
    git curl zip unzip libpng-dev libonig-dev libxml2-dev \
    libzip-dev libicu-dev nodejs npm \
    && docker-php-ext-install pdo pdo_mysql mbstring exif pcntl bcmath zip intl gd \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Copy full application first
COPY . .

# Create .env from example if not present
RUN cp -n .env.example .env 2>/dev/null || true

# Install PHP dependencies (skip scripts, artisan needs .env)
RUN composer install --no-dev --optimize-autoloader --no-interaction --no-scripts

# Generate optimized autoload and discover packages
RUN composer dump-autoload --optimize
RUN php artisan package:discover --ansi

# Install Node dependencies and build frontend
RUN npm ci && npm run build

# Set permissions
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html/storage \
    && chmod -R 755 /var/www/html/bootstrap/cache

EXPOSE 8000

CMD php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=8000
