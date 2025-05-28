#!/usr/bin/env bash
set -euo pipefail

echo "🚀 Bringing up Docker containers..."
docker-compose up -d --build