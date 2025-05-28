#!/usr/bin/env bash
set -euo pipefail
echo "⏳ Waiting for database..."
while [ ! -f dev.db ]; do sleep 0.5; done