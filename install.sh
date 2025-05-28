#!/usr/bin/env bash
set -euo pipefail

# Ensure our helper scripts are executable
chmod +x scripts/*.sh

# 1) Install prereqs (Docker & Compose)
echo "🔧 Checking Docker & Docker Compose…"
scripts/prereqs.sh

# 2) Setup env vars if needed
if [ ! -f .env.local ]; then
  echo "🔑 Creating .env.local…"
  scripts/env_setup.sh
else
  echo "✅ .env.local already exists, skipping env setup"
fi

# 3) Copy to .env for Docker Compose
if [ ! -f .env ]; then
  echo "📋 Copying .env.local → .env"
  cp .env.local .env
else
  echo "✅ .env already exists, not overwriting"
fi

# 4) Fire up the containers
echo "🚀 Launching VinylGPT…"
scripts/compose_up.sh
