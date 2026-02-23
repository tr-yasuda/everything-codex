#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
REPO_AGENTS="${REPO_ROOT}/AGENTS.md"
CODEX_DIR="${HOME}/.codex"
TARGET="${CODEX_DIR}/AGENTS.md"

if [[ ! -f "${REPO_AGENTS}" ]]; then
  echo "Error: ${REPO_AGENTS} が見つかりません。" >&2
  exit 1
fi

mkdir -p "${CODEX_DIR}"

if [[ -L "${TARGET}" ]]; then
  CURRENT_TARGET="$(readlink "${TARGET}")"
  if [[ "${CURRENT_TARGET}" == "${REPO_AGENTS}" ]]; then
    echo "OK: 既に正しいリンクです: ${TARGET} -> ${CURRENT_TARGET}"
    exit 0
  fi
fi

if [[ -e "${TARGET}" || -L "${TARGET}" ]]; then
  BACKUP="${TARGET}.bak.$(date +%Y%m%d%H%M%S)"
  mv "${TARGET}" "${BACKUP}"
  echo "Backup: ${TARGET} -> ${BACKUP}"
fi

ln -s "${REPO_AGENTS}" "${TARGET}"
echo "Linked: ${TARGET} -> ${REPO_AGENTS}"

