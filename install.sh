#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_AGENTS="${SCRIPT_DIR}/AGENTS.md"
REPO_CONFIG="${SCRIPT_DIR}/config.toml"
REPO_SKILLS="${SCRIPT_DIR}/skills"
CODEX_DIR="${HOME}/.codex"
TARGET_AGENTS="${CODEX_DIR}/AGENTS.md"
TARGET_CONFIG="${CODEX_DIR}/config.toml"
TARGET_SKILLS="${CODEX_DIR}/skills"

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
    local attempt=0
    local max_attempts=10
    backup="${target}.bak.$(date +%Y%m%d%H%M%S).$RANDOM"
    while [[ ( -e "${backup}" || -L "${backup}" ) && "${attempt}" -lt "${max_attempts}" ]]; do
      attempt=$((attempt + 1))
      backup="${target}.bak.$(date +%Y%m%d%H%M%S).$RANDOM"
    done
    if [[ -e "${backup}" || -L "${backup}" ]]; then
      echo "Error: バックアップファイル名を一意にできませんでした: ${backup}" >&2
      exit 1
    fi
    mv "${target}" "${backup}"
    echo "Backup: ${target} -> ${backup}"
  fi

  ln -s "${source_realpath}" "${target}"
  echo "Linked: ${target} -> ${source_realpath}"
}

mkdir -p "${CODEX_DIR}"

ensure_link "${REPO_AGENTS}" "${TARGET_AGENTS}"
ensure_link "${REPO_CONFIG}" "${TARGET_CONFIG}"

ensure_skill_links() {
  local source_root="$1"
  local target_root="$2"
  local skill_dir

  if [[ ! -d "${source_root}" ]]; then
    return
  fi

  mkdir -p "${target_root}"

  shopt -s nullglob
  for skill_dir in "${source_root}"/*; do
    if [[ ! -d "${skill_dir}" ]]; then
      continue
    fi
    if [[ ! -f "${skill_dir}/SKILL.md" ]]; then
      continue
    fi

    local skill_name
    skill_name="$(basename "${skill_dir}")"
    ensure_link "${skill_dir}" "${target_root}/${skill_name}"
  done
  shopt -u nullglob
}

ensure_skill_links "${REPO_SKILLS}" "${TARGET_SKILLS}"
