#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_AGENTS="${SCRIPT_DIR}/AGENTS.md"
CODEX_DIR="${HOME}/.codex"
TARGET="${CODEX_DIR}/AGENTS.md"

canonicalize_path() {
  local path="$1"

  if command -v realpath >/dev/null 2>&1; then
    realpath "${path}"
    return
  fi

  if readlink -f / >/dev/null 2>&1; then
    readlink -f "${path}"
    return
  fi

  echo "Error: パス正規化に 'realpath' または 'readlink -f' が必要です。" >&2
  return 1
}

if [[ ! -f "${REPO_AGENTS}" ]]; then
  echo "Error: ${REPO_AGENTS} が見つかりません。" >&2
  exit 1
fi

mkdir -p "${CODEX_DIR}"
REPO_AGENTS_REALPATH="$(canonicalize_path "${REPO_AGENTS}")"

if [[ -L "${TARGET}" ]]; then
  CURRENT_TARGET_REALPATH="$(canonicalize_path "${TARGET}")"
  if [[ "${CURRENT_TARGET_REALPATH}" == "${REPO_AGENTS_REALPATH}" ]]; then
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
