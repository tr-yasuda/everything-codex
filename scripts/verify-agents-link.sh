#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
EXPECTED="${REPO_ROOT}/AGENTS.md"
TARGET="${HOME}/.codex/AGENTS.md"

if [[ ! -L "${TARGET}" ]]; then
  echo "NG: ${TARGET} はシンボリックリンクではありません。"
  exit 1
fi

ACTUAL="$(readlink "${TARGET}")"
if [[ "${ACTUAL}" != "${EXPECTED}" ]]; then
  echo "NG: リンク先が異なります。"
  echo "  expected: ${EXPECTED}"
  echo "  actual:   ${ACTUAL}"
  exit 1
fi

echo "OK: ${TARGET} -> ${ACTUAL}"

