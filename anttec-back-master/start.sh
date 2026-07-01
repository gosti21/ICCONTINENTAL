#!/bin/sh
set -e

PORT="${PORT:-10000}"
sed -i "s/PORT_PLACEHOLDER/${PORT}/" /etc/nginx/sites-available/default

php artisan migrate --force
php artisan config:cache

php-fpm -D
nginx -g 'daemon off;'