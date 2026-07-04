#!/usr/bin/env sh
set -eu

project_name="luma-customer-service"
database_volume="${project_name}_luma-postgres"
fresh_install=true

if docker volume inspect "$database_volume" >/dev/null 2>&1; then
  fresh_install=false
fi

docker build --target migrator -t luma-customer-service-migrate .
docker build -t luma-customer-service-luma .
docker compose up -d --no-build

port="${LUMA_PORT:-3000}"
base_url="${APP_BASE_URL:-http://localhost:$port}"
printf '\nLuma is running at %s\n' "$base_url"

if [ "$fresh_install" = "true" ]; then
  password=$(
    docker compose run --rm --no-deps --entrypoint cat key-init \
      /run/luma-bootstrap/admin.password 2>/dev/null
  )
  printf 'Initial owner: %s\n' "${AUTH_SEED_EMAIL:-admin@luma.local}"
  printf 'Initial password: %s\n' "$password"
  printf 'Change the password after the first login.\n'
else
  printf 'Existing database detected; use the current owner password.\n'
fi
