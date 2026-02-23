#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_AGENTS="${SCRIPT_DIR}/AGENTS.md"
REPO_CONFIG="${SCRIPT_DIR}/config.toml"
CODEX_DIR="${HOME}/.codex"
TARGET_AGENTS="${CODEX_DIR}/AGENTS.md"
TARGET_CONFIG="${CODEX_DIR}/config.toml"

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

if [[ ! -f "${REPO_CONFIG}" ]]; then
  echo "Error: ${REPO_CONFIG} が見つかりません。" >&2
  exit 1
fi

ensure_link() {
  local source="$1"
  local target="$2"

  local source_realpath
  source_realpath="$(canonicalize_path "${source}")"

  if [[ -L "${target}" ]]; then
    local current_target_realpath
    current_target_realpath="$(canonicalize_path "${target}" 2>/dev/null || true)"
    if [[ -n "${current_target_realpath}" ]] && [[ "${current_target_realpath}" == "${source_realpath}" ]]; then
      echo "OK: 既に正しいリンクです: ${target} -> ${current_target_realpath}"
      return
    fi
  fi

  if [[ -e "${target}" || -L "${target}" ]]; then
    local backup
    backup="$(mktemp "${target}.bak.XXXXXX")"
    mv "${target}" "${backup}"
    echo "Backup: ${target} -> ${backup}"
  fi

  ln -s "${source_realpath}" "${target}"
  echo "Linked: ${target} -> ${source_realpath}"
}

mkdir -p "${CODEX_DIR}"

ensure_link "${REPO_AGENTS}" "${TARGET_AGENTS}"
ensure_link "${REPO_CONFIG}" "${TARGET_CONFIG}"
