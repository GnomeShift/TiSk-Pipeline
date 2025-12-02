#!/bin/sh

set -e

export API_URL="${API_URL}"
export APP_TITLE="${APP_TITLE}"

echo "=== Configuration ==="
echo "API_URL: $API_URL"
echo "APP_TITLE: $APP_TITLE"

envsubst < /app/dist/config.js > /app/dist/config.js.tmp
mv /app/dist/config.js.tmp /app/dist/config.js
exec npm run preview -- --host 0.0.0.0 --port 4173
