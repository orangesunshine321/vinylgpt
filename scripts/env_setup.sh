#!/usr/bin/env bash
set -euo pipefail

[[ -f .env.local ]] && { echo ".env.local already exists"; exit 1; }

read -rp "🔑 OpenAI API Key: " OPENAI_API_KEY
read -rp "🎵 Discogs User Token: " DISCOGS_TOKEN
cat > .env.local <<EOF
OPENAI_API_KEY=$OPENAI_API_KEY
DISCOGS_TOKEN=$DISCOGS_TOKEN
DATABASE_URL=file:./dev.db
EOF