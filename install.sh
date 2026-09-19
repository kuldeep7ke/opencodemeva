#!/usr/bin/env bash
# opencodemeva installer for Ubuntu/Debian (Bash)
# Usage: ./install.sh [--target <dir>] [--overwrite] [--dry-run]
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if ! command -v node >/dev/null 2>&1; then
  echo "ERROR: Node.js is required but was not found on PATH." >&2
  echo "Install Node.js >= 18, e.g.: curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt-get install -y nodejs" >&2
  exit 1
fi

MAJOR="$(node -e "console.log(process.versions.node.split('.')[0])")"
if [ "$MAJOR" -lt 18 ]; then
  echo "ERROR: Node.js 18+ is required (found: $(node --version))." >&2
  exit 1
fi

node "$ROOT/src/cli.js" install "$@"
exit $?