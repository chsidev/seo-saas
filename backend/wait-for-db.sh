#!/bin/sh

echo " Waiting for Postgres..."

while ! nc -z db 5432; do
  sleep 0.5
done

echo " Postgres is up - starting FastAPI"
exec "$@"
