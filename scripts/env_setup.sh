#!/usr/bin/env bash
set -euo pipefail

ENV_FILE=".env.local"

# 1️⃣ Create .env.local if missing
if [ ! -f "$ENV_FILE" ]; then
  echo "Creating $ENV_FILE…"
  touch "$ENV_FILE"
fi

# 2️⃣ Prompt for OpenAI API key
read -rp "🔑 OpenAI API Key: " OPENAI_KEY
grep -q '^OPENAI_API_KEY=' "$ENV_FILE" && sed -i '/^OPENAI_API_KEY=/d' "$ENV_FILE"
echo "OPENAI_API_KEY=${OPENAI_KEY}" >> "$ENV_FILE"

# 3️⃣ Prompt for Discogs token
read -rp "🎵 Discogs User Token: " DISCOGS_TOKEN
grep -q '^DISCOGS_TOKEN=' "$ENV_FILE" && sed -i '/^DISCOGS_TOKEN=/d' "$ENV_FILE"
echo "DISCOGS_TOKEN=${DISCOGS_TOKEN}" >> "$ENV_FILE"

# 4️⃣ Prompt for GCP service-account JSON
echo
echo "📂 GCP Service Account JSON"
echo "Place your Google Cloud Vision service-account JSON file on this machine."
read -rp "Path to your JSON key (or leave blank to skip): " GCP_PATH

if [ -n "$GCP_PATH" ]; then
  if [ ! -f "$GCP_PATH" ]; then
    echo "❌ File not found at '$GCP_PATH'. Exiting."
    exit 1
  fi
  echo "Copying your key into the project (but not committing it)…"
  cp "$GCP_PATH" "./gcp-sa.json"
  echo "Added to .gitignore."
  grep -q '^gcp-sa.json$' .gitignore || echo "gcp-sa.json" >> .gitignore

  # Set the env var
  grep -q '^GOOGLE_APPLICATION_CREDENTIALS=' "$ENV_FILE" && sed -i '/^GOOGLE_APPLICATION_CREDENTIALS=/d' "$ENV_FILE"
  echo "GOOGLE_APPLICATION_CREDENTIALS=./gcp-sa.json" >> "$ENV_FILE"
else
  echo "⚠️  Skipped GCP setup. You must add GOOGLE_APPLICATION_CREDENTIALS yourself later if you want OCR."
fi

echo
echo "✅ Environment setup complete!"
