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

# --- Cache PHP dependencies ---
# Copy only composer files first so this layer is cached until they change
COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-interaction --no-scripts

# --- Cache Node dependencies ---
# Copy only package files first so this layer is cached until they change
COPY package.json package-lock.json ./
RUN npm ci --prefer-offline

# --- Copy full application ---
COPY . .

# Run post-autoload-dump scripts and build frontend
RUN composer dump-autoload --optimize \
    && npm run build

# Set permissions
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html/storage \
    && chmod -R 755 /var/www/html/bootstrap/cache

EXPOSE 8000

CMD php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=8000
