#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if command -v bun >/dev/null 2>&1; then
  exec bun --env-file /dev/null "${script_dir}/src/index.ts"
fi

if command -v node >/dev/null 2>&1; then
  exec node "${script_dir}/dist/index.js"
fi

printf '[OpenRouter] [missing runtime: install bun or node]\n'
