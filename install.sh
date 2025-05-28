#!/usr/bin/env bash
set -euo pipefail
chmod +x scripts/*.sh
scripts/prereqs.sh
scripts/env_setup.sh
scripts/compose_up.sh