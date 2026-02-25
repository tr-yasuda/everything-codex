#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_AGENTS="${SCRIPT_DIR}/.codex/AGENTS.md"
REPO_CONFIG="${SCRIPT_DIR}/config.toml"
REPO_SKILLS="${SCRIPT_DIR}/skills"
REPO_RULES="${SCRIPT_DIR}/rules"
CODEX_DIR="${HOME}/.codex"
TARGET_AGENTS="${CODEX_DIR}/AGENTS.md"
TARGET_CONFIG="${CODEX_DIR}/config.toml"
TARGET_SKILLS="${CODEX_DIR}/skills"
TARGET_RULES="${CODEX_DIR}/rules"

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

make_backup_path() {
  local target="$1"
  local timestamp
  local backup
  local suffix=0

  timestamp="$(date +%Y%m%d%H%M%S)"
  backup="${target}.bak.${timestamp}.$$"

  while [[ -e "${backup}" || -L "${backup}" ]]; do
    suffix=$((suffix + 1))
    backup="${target}.bak.${timestamp}.$$.${suffix}"
  done

  printf '%s\n' "${backup}"
}

ensure_link() {
  local source="$1"
  local target="$2"

  local source_realpath
  source_realpath="$(canonicalize_path "${source}")"

  if [[ -e "${target}" || -L "${target}" ]]; then
    local current_target_realpath
    current_target_realpath="$(canonicalize_path "${target}" 2>/dev/null || true)"
    if [[ -n "${current_target_realpath}" ]] && [[ "${current_target_realpath}" == "${source_realpath}" ]]; then
      echo "OK: 既に正しいリンクです: ${target} -> ${current_target_realpath}"
      return
    fi
    local backup
    # ディレクトリでも退避できるように、未使用パスを生成してから mv する。
    backup="$(make_backup_path "${target}")"
    mv "${target}" "${backup}"
    echo "Backup: ${target} -> ${backup}"
  fi

  ln -s "${source_realpath}" "${target}"
  echo "Linked: ${target} -> ${source_realpath}"
}

mkdir -p "${CODEX_DIR}" "${TARGET_SKILLS}"

ensure_link "${REPO_AGENTS}" "${TARGET_AGENTS}"
ensure_link "${REPO_CONFIG}" "${TARGET_CONFIG}"

if [[ -d "${REPO_SKILLS}" ]]; then
  shopt -s nullglob
  skill_dirs=("${REPO_SKILLS}"/*)
  shopt -u nullglob

  if [[ "${#skill_dirs[@]}" -eq 0 ]]; then
    echo "Info: ${REPO_SKILLS} にリンク対象のスキルがありません。"
  fi

  for skill_path in "${skill_dirs[@]}"; do
    if [[ -d "${skill_path}" ]]; then
      skill_name="$(basename "${skill_path}")"
      ensure_link "${skill_path}" "${TARGET_SKILLS}/${skill_name}"
    fi
  done
else
  echo "Info: ${REPO_SKILLS} がないため skills のリンクは作成しません。"
fi

if [[ -d "${REPO_RULES}" ]]; then
  ensure_link "${REPO_RULES}" "${TARGET_RULES}"
else
  echo "Info: ${REPO_RULES} がないため rules のリンクは作成しません。"
fi
