FROM php:8.4-fpm

RUN apt-get update && apt-get install -y \
    git curl libpng-dev libonig-dev libxml2-dev libzip-dev libpq-dev zip unzip nginx \
    && docker-php-ext-install pdo_pgsql mbstring exif pcntl bcmath gd zip

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
WORKDIR /var/www/html
COPY . .
RUN composer install --no-dev --optimize-autoloader
RUN chmod -R 775 storage bootstrap/cache

COPY nginx.conf /etc/nginx/sites-available/default
EXPOSE 10000
CMD php artisan migrate --force && php artisan config:cache && \
    php-fpm -D && nginx -g 'daemon off;'