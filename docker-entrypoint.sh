#!/bin/sh

set -e

echo "=== Configuration ==="
echo "API_URL: $API_URL"
echo "APP_TITLE: $APP_TITLE"

envsubst < /srv/config.js > /srv/config.js.tmp
mv /srv/config.js.tmp /srv/config.js

exec caddy run --config /etc/caddy/Caddyfile --adapter caddyfile
