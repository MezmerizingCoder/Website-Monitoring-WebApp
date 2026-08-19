FROM php:8.2-fpm-alpine

# system deps
RUN apk add --no-cache \
    autoconf \
    bash \
    build-base \
    libpng-dev \
    libzip-dev \
    oniguruma-dev \
    zip \
    unzip \
    git \
    icu-dev

# Install PHP extensions
RUN docker-php-ext-install pdo pdo_mysql mbstring zip exif pcntl bcmath intl

# Install composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Create working dir
WORKDIR /var/www/html

# Copy existing application directory permissions
COPY --chown=www-data:www-data . /var/www/html

# Expose
EXPOSE 9000
CMD ["php-fpm"]
