#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_AGENTS="${SCRIPT_DIR}/AGENTS.md"
CODEX_DIR="${HOME}/.codex"
TARGET="${CODEX_DIR}/AGENTS.md"

if [[ ! -f "${REPO_AGENTS}" ]]; then
  echo "Error: ${REPO_AGENTS} が見つかりません。" >&2
  exit 1
fi

mkdir -p "${CODEX_DIR}"

if [[ -L "${TARGET}" ]]; then
  CURRENT_TARGET_REALPATH="$(realpath "${TARGET}" 2>/dev/null || true)"
  REPO_AGENTS_REALPATH="$(realpath "${REPO_AGENTS}" 2>/dev/null || true)"
  if [[ -n "${CURRENT_TARGET_REALPATH}" ]] && [[ "${CURRENT_TARGET_REALPATH}" == "${REPO_AGENTS_REALPATH}" ]]; then
    echo "OK: 既に正しいリンクです: ${TARGET} -> ${CURRENT_TARGET_REALPATH}"
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
