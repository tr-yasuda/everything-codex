#!/usr/bin/env bash
set -euo pipefail

ALLOWED_KINDS=(feat fix docs style refactor perf test build ci chore revert)
AUTO_BEGIN="<!-- AUTO-GENERATED:BEGIN -->"
AUTO_END="<!-- AUTO-GENERATED:END -->"
TEMP_FILES=()

new_temp_file() {
  local file
  file="$(mktemp)"
  TEMP_FILES+=("${file}")
  printf '%s' "${file}"
}

cleanup_temp_files() {
  local file
  for file in "${TEMP_FILES[@]}"; do
    if [[ -n "${file}" ]] && [[ -e "${file}" || -L "${file}" ]]; then
      rm -f "${file}"
    fi
  done
}

print_error() {
  printf 'Error: %s\n' "$1" >&2
}

require_command() {
  local cmd="$1"
  if ! command -v "${cmd}" >/dev/null 2>&1; then
    print_error "'${cmd}' が見つかりません。"
    exit 1
  fi
}

slugify() {
  local input="$1"
  printf '%s' "${input}" \
    | tr '[:upper:]' '[:lower:]' \
    | sed -E 's/[^a-z0-9]+/-/g; s/^-+//; s/-+$//; s/-+/-/g'
}

has_non_ascii() {
  local input="$1"
  LC_ALL=C grep -q '[^ -~]' <<<"${input}"
}

prompt_required() {
  local label="$1"
  local default="${2:-}"
  local value

  while true; do
    if [[ -n "${default}" ]]; then
      read -r -p "${label} [${default}]: " value
      value="${value:-${default}}"
    else
      read -r -p "${label}: " value
    fi

    if [[ -n "${value}" ]]; then
      printf '%s' "${value}"
      return
    fi
    printf '値を入力してください。\n'
  done
}

prompt_optional() {
  local label="$1"
  local default="${2:-}"
  local value

  if [[ -n "${default}" ]]; then
    read -r -p "${label} [${default}]: " value
    printf '%s' "${value:-${default}}"
    return
  fi

  read -r -p "${label} (任意): " value
  printf '%s' "${value}"
}

confirm_or_exit() {
  local prompt="$1"
  local answer
  read -r -p "${prompt} [y/N]: " answer
  if [[ ! "${answer}" =~ ^[Yy]$ ]]; then
    printf 'キャンセルしました。\n'
    exit 1
  fi
}

kind_is_valid() {
  local input="$1"
  local kind
  for kind in "${ALLOWED_KINDS[@]}"; do
    if [[ "${kind}" == "${input}" ]]; then
      return 0
    fi
  done
  return 1
}

remote_exists() {
  local remote="$1"
  if [[ -z "${remote}" ]]; then
    return 1
  fi
  git remote get-url "${remote}" >/dev/null 2>&1
}

resolve_default_remote() {
  local default_branch="${1:-}"
  local remote
  local current_branch
  local remote_list=()
  local head_ref
  local head_remote

  if [[ -n "${default_branch}" ]]; then
    remote="$(git config --get "branch.${default_branch}.remote" 2>/dev/null || true)"
    if remote_exists "${remote}"; then
      printf '%s' "${remote}"
      return
    fi
  fi

  remote="$(git config --get remote.pushDefault 2>/dev/null || true)"
  if remote_exists "${remote}"; then
    printf '%s' "${remote}"
    return
  fi

  current_branch="$(git branch --show-current 2>/dev/null || true)"
  if [[ -n "${current_branch}" ]]; then
    remote="$(git config --get "branch.${current_branch}.remote" 2>/dev/null || true)"
    if remote_exists "${remote}"; then
      printf '%s' "${remote}"
      return
    fi
  fi

  mapfile -t remote_list < <(git remote)
  if (( ${#remote_list[@]} == 1 )); then
    printf '%s' "${remote_list[0]}"
    return
  fi

  if remote_exists "origin"; then
    printf 'origin'
    return
  fi

  head_ref="$(git for-each-ref --format='%(refname:short)' refs/remotes/*/HEAD | head -n 1 || true)"
  if [[ -n "${head_ref}" ]]; then
    head_remote="${head_ref%/HEAD}"
    if remote_exists "${head_remote}"; then
      printf '%s' "${head_remote}"
      return
    fi
  fi

  printf ''
}

get_default_branch() {
  local remote="${1:-}"
  local branch
  local ref
  local remote_name

  branch="$(gh repo view --json defaultBranchRef --jq '.defaultBranchRef.name' 2>/dev/null || true)"
  if [[ -n "${branch}" ]] && [[ "${branch}" != "null" ]]; then
    printf '%s' "${branch}"
    return
  fi

  if [[ -n "${remote}" ]]; then
    ref="$(git symbolic-ref --quiet --short "refs/remotes/${remote}/HEAD" 2>/dev/null || true)"
    if [[ -n "${ref}" ]]; then
      printf '%s' "${ref#${remote}/}"
      return
    fi

    branch="$(git remote show -n "${remote}" 2>/dev/null | sed -n 's/^[[:space:]]*HEAD branch: //p' | head -n 1)"
    if [[ -n "${branch}" ]] && [[ "${branch}" != "(unknown)" ]]; then
      printf '%s' "${branch}"
      return
    fi
  fi

  while IFS= read -r remote_name; do
    [[ -z "${remote_name}" ]] && continue
    ref="$(git symbolic-ref --quiet --short "refs/remotes/${remote_name}/HEAD" 2>/dev/null || true)"
    if [[ -n "${ref}" ]]; then
      printf '%s' "${ref#${remote_name}/}"
      return
    fi
  done < <(git remote)

  printf ''
}

branch_exists_locally() {
  local branch="$1"
  local remote="${2:-}"
  git show-ref --verify --quiet "refs/heads/${branch}" && return 0
  if [[ -n "${remote}" ]]; then
    git show-ref --verify --quiet "refs/remotes/${remote}/${branch}" && return 0
  fi
  return 1
}

build_branch_name() {
  local kind="$1"
  local scope="$2"
  local slug="$3"

  if [[ -n "${scope}" ]]; then
    printf '%s/%s/%s' "${kind}" "${scope}" "${slug}"
    return
  fi
  printf '%s/%s' "${kind}" "${slug}"
}

get_open_pr_if_checked_out_branch_matches() {
  local branch="$1"
  local row
  local number
  local state
  local head
  local base

  row="$(gh pr view --json number,state,headRefName,baseRefName --jq '[.number,.state,.headRefName,.baseRefName]|@tsv' 2>/dev/null || true)"
  if [[ -z "${row}" ]]; then
    printf ''
    return
  fi

  IFS=$'\t' read -r number state head base <<< "${row}"
  if [[ "${state}" == "OPEN" ]] && [[ "${head}" == "${branch}" ]]; then
    printf '%s\t%s' "${number}" "${base}"
  fi
}

find_pr_template() {
  local file
  local candidates=(
    ".github/pull_request_template.md"
    ".github/PULL_REQUEST_TEMPLATE.md"
  )

  for file in "${candidates[@]}"; do
    if [[ -f "${file}" ]]; then
      printf '%s' "${file}"
      return 0
    fi
  done

  if [[ -d ".github/PULL_REQUEST_TEMPLATE" ]]; then
    local templates=()
    shopt -s nullglob
    templates=(.github/PULL_REQUEST_TEMPLATE/*.md)
    shopt -u nullglob
    if (( ${#templates[@]} > 0 )); then
      printf '%s' "${templates[0]}"
      return 0
    fi
  fi

  return 1
}

resolve_base_ref() {
  local base_branch="$1"
  local remote="${2:-}"

  if [[ -n "${remote}" ]] && git rev-parse --verify --quiet "${remote}/${base_branch}" >/dev/null 2>&1; then
    printf '%s/%s' "${remote}" "${base_branch}"
    return
  fi

  if git rev-parse --verify --quiet "${base_branch}" >/dev/null 2>&1; then
    printf '%s' "${base_branch}"
    return
  fi

  printf ''
}

build_auto_section() {
  local branch_name="$1"
  local base_branch="$2"
  local base_ref="$3"
  local diff_summary
  local diff_summary_line
  local commit_lines
  local file_lines
  local fallback_warning=""

  if [[ -n "${base_ref}" ]]; then
    diff_summary="$(git diff --shortstat "${base_ref}...HEAD" 2>/dev/null || true)"
    commit_lines="$(git log --no-merges --pretty='- %h %s' "${base_ref}..HEAD" 2>/dev/null || true)"
    file_lines="$(git diff --name-only "${base_ref}...HEAD" 2>/dev/null | sed 's/^/- /' || true)"
  else
    fallback_warning="- Warning: Unable to resolve base branch \`${base_branch}\`. Showing fallback information from recent commits and HEAD changes."
    diff_summary=""
    commit_lines="$(git log --no-merges --pretty='- %h %s' -n 20 HEAD 2>/dev/null || true)"
    file_lines="$(git show --pretty='' --name-only HEAD 2>/dev/null | sed 's/^/- /' || true)"
  fi

  if [[ -z "${diff_summary}" ]]; then
    if [[ -z "${fallback_warning}" ]]; then
      diff_summary="Unable to collect a diff summary."
    fi
  fi
  if [[ -z "${commit_lines}" ]]; then
    commit_lines="- Unable to collect commit information."
  fi
  if [[ -z "${file_lines}" ]]; then
    file_lines="- Unable to collect changed file information."
  fi
  diff_summary_line=""
  if [[ -n "${diff_summary}" ]]; then
    diff_summary_line="- ${diff_summary}"
  fi

  cat <<EOF
${AUTO_BEGIN}
## Background
- Merge changes from \`${branch_name}\` into \`${base_branch}\`.

## Changes
${fallback_warning}
${diff_summary_line}
${commit_lines}

## Verification
${file_lines}

## Impact
- Changes may affect features related to the files above.
${AUTO_END}
EOF
}

merge_body_with_auto() {
  local current_body="$1"
  local auto_section="$2"
  local output_file="$3"
  local body_file
  local auto_file
  local begin_line
  local end_line

  body_file="$(new_temp_file)"
  auto_file="$(new_temp_file)"

  printf '%s' "${current_body}" > "${body_file}"
  printf '%s' "${auto_section}" > "${auto_file}"

  begin_line="$(grep -nF "${AUTO_BEGIN}" "${body_file}" | head -n 1 | cut -d: -f1 || true)"
  end_line=""
  if [[ -n "${begin_line}" ]]; then
    end_line="$(grep -nF "${AUTO_END}" "${body_file}" | awk -F: -v b="${begin_line}" '$1 > b {print $1; exit}' || true)"
  fi

  if [[ -n "${begin_line}" ]] && [[ -n "${end_line}" ]]; then
    awk -v begin="${AUTO_BEGIN}" -v end="${AUTO_END}" -v auto_file="${auto_file}" '
      function print_auto(    line) {
        while ((getline line < auto_file) > 0) {
          print line
        }
        close(auto_file)
      }
      BEGIN { skip=0; replaced=0 }
      {
        if ($0 == begin && replaced == 0) {
          print_auto()
          skip=1
          replaced=1
          next
        }
        if (skip == 1) {
          if ($0 == end) {
            skip=0
          }
          next
        }
        print
      }
      END {
        if (replaced == 0) {
          if (NR > 0) {
            print ""
          }
          print_auto()
        }
      }
    ' "${body_file}" > "${output_file}"
  else
    cat "${body_file}" > "${output_file}"
    if [[ -s "${output_file}" ]]; then
      printf '\n\n' >> "${output_file}"
    fi
    cat "${auto_file}" >> "${output_file}"
  fi
}

main() {
  local current_branch
  local default_remote
  local default_branch
  local base_branch
  local kind
  local scope_input
  local scope
  local subject
  local commit_message
  local slug_default
  local slug_input=""
  local slug
  local target_branch
  local branch_created=0
  local existing_pr_number
  local existing_pr_base
  local pr_title
  local has_changes
  local push_mode
  local body_source
  local auto_section
  local base_ref
  local body_file
  local pr_url
  local template_path
  local english_policy_issues=()
  local existing_pr_info

  require_command git
  require_command gh

  if ! gh auth status >/dev/null 2>&1; then
    print_error "gh の認証状態を確認できません。先に 'gh auth login' を実行してください。"
    exit 1
  fi

  trap cleanup_temp_files EXIT INT TERM

  if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    print_error "Git リポジトリで実行してください。"
    exit 1
  fi

  has_changes="$(git status --porcelain)"
  if [[ -z "${has_changes}" ]]; then
    printf '変更がありません。処理を終了します。\n'
    exit 0
  fi

  current_branch="$(git branch --show-current)"
  if [[ -z "${current_branch}" ]]; then
    print_error "現在のブランチ名を取得できません。"
    exit 1
  fi

  default_remote="$(resolve_default_remote)"
  default_branch="$(get_default_branch "${default_remote}")"
  if [[ -z "${default_branch}" ]]; then
    print_error "デフォルトブランチを判定できません。'gh repo view' の実行可否、または 'git remote set-head <remote> -a' を確認してください。"
    exit 1
  fi

  default_remote="$(resolve_default_remote "${default_branch}")"
  if [[ -z "${default_remote}" ]]; then
    print_error "push 先リモートを判定できません。'git config remote.pushDefault <remote>' などで既定リモートを設定してください。"
    exit 1
  fi

  printf '言語ポリシー: commit subject / scope / branch slug / PR title は英語を推奨します。\n'

  while true; do
    kind="$(prompt_required "conventional commit の kind (${ALLOWED_KINDS[*]})")"
    if kind_is_valid "${kind}"; then
      break
    fi
    printf 'kind が不正です。再入力してください。\n'
  done

  while true; do
    scope_input="$(prompt_optional "scope")"
    if [[ -z "${scope_input}" ]]; then
      scope=""
      break
    fi

    scope="$(slugify "${scope_input}")"
    if [[ -n "${scope}" ]]; then
      break
    fi
    printf 'scope は英数字で入力してください。例: api, ui, auth\n'
  done

  subject="$(prompt_required "commit subject")"
  if [[ -n "${scope}" ]]; then
    commit_message="${kind}(${scope}): ${subject}"
  else
    commit_message="${kind}: ${subject}"
  fi

  target_branch="${current_branch}"
  if [[ "${current_branch}" == "${default_branch}" ]]; then
    slug_default="$(slugify "${subject}")"
    while true; do
      slug_input="$(prompt_required "branch slug" "${slug_default}")"
      slug="$(slugify "${slug_input}")"
      if [[ -n "${slug}" ]]; then
        break
      fi
      printf 'branch slug は英数字で入力してください。例: add-login-api\n'
    done

    target_branch="$(build_branch_name "${kind}" "${scope}" "${slug}")"
    if branch_exists_locally "${target_branch}" "${default_remote}"; then
      target_branch="${target_branch}-$(date +%Y%m%d%H%M%S)"
      printf '同名ブランチがあるため、`%s` を使用します。\n' "${target_branch}"
    fi
  fi

  existing_pr_number=""
  existing_pr_base=""
  if [[ "${current_branch}" != "${default_branch}" ]]; then
    existing_pr_info="$(get_open_pr_if_checked_out_branch_matches "${target_branch}")"
    if [[ -n "${existing_pr_info}" ]]; then
      IFS=$'\t' read -r existing_pr_number existing_pr_base <<< "${existing_pr_info}"
    fi
  fi

  base_branch="${existing_pr_base:-${default_branch}}"
  base_branch="$(prompt_required "base branch" "${base_branch}")"
  pr_title="$(prompt_required "PR title" "${commit_message}")"

  if has_non_ascii "${subject}"; then
    english_policy_issues+=("commit subject")
  fi
  if [[ -n "${scope_input}" ]] && has_non_ascii "${scope_input}"; then
    english_policy_issues+=("scope")
  fi
  if [[ "${current_branch}" == "${default_branch}" ]] && has_non_ascii "${slug_input}"; then
    english_policy_issues+=("branch slug")
  fi
  if has_non_ascii "${pr_title}"; then
    english_policy_issues+=("PR title")
  fi

  if (( ${#english_policy_issues[@]} > 0 )); then
    printf '\n注意: 次の項目は英語以外の文字を含みます: %s\n' "${english_policy_issues[*]}"
    confirm_or_exit "このまま続行しますか?"
  fi

  printf '\n実行内容:\n'
  printf '%s\n' "- branch: ${target_branch}"
  printf '%s\n' "- commit: ${commit_message}"
  printf '%s\n' "- base: ${base_branch}"
  printf '%s\n' "- PR title: ${pr_title}"
  if [[ -n "${existing_pr_number}" ]]; then
    printf '%s\n' "- mode: 既存PR更新 (#${existing_pr_number})"
  else
    printf '%s\n' "- mode: 新規PR作成"
  fi

  confirm_or_exit "この内容で実行しますか?"

  git add -A
  if git diff --cached --quiet; then
    printf 'ステージされた変更がありません。処理を終了します。\n'
    exit 0
  fi

  if [[ "${current_branch}" == "${default_branch}" ]]; then
    git checkout -b "${target_branch}"
    branch_created=1
  fi

  git commit -m "${commit_message}"

  push_mode="normal"
  if ! git rev-parse --abbrev-ref --symbolic-full-name '@{upstream}' >/dev/null 2>&1; then
    push_mode="with-upstream"
  fi

  if [[ "${push_mode}" == "with-upstream" ]]; then
    git push -u "${default_remote}" "${target_branch}"
  else
    git push
  fi

  if [[ -z "${existing_pr_number}" ]]; then
    existing_pr_info="$(get_open_pr_if_checked_out_branch_matches "${target_branch}")"
    if [[ -n "${existing_pr_info}" ]]; then
      IFS=$'\t' read -r existing_pr_number _ <<< "${existing_pr_info}"
    fi
  fi
  base_ref="$(resolve_base_ref "${base_branch}" "${default_remote}")"
  auto_section="$(build_auto_section "${target_branch}" "${base_branch}" "${base_ref}")"

  if [[ -n "${existing_pr_number}" ]]; then
    body_source="$(gh pr view "${existing_pr_number}" --json body --jq '.body')"
  else
    template_path="$(find_pr_template || true)"
    body_source=""
    if [[ -n "${template_path}" ]]; then
      printf 'PRテンプレートを使用します: %s\n' "${template_path}"
      body_source="$(cat "${template_path}")"
    fi
  fi

  body_file="$(new_temp_file)"
  merge_body_with_auto "${body_source}" "${auto_section}" "${body_file}"

  if [[ -n "${existing_pr_number}" ]]; then
    gh pr edit "${existing_pr_number}" --base "${base_branch}" --title "${pr_title}" --body-file "${body_file}"
    pr_url="$(gh pr view "${existing_pr_number}" --json url --jq '.url')"
  else
    pr_url="$(gh pr create --base "${base_branch}" --head "${target_branch}" --title "${pr_title}" --body-file "${body_file}")"
  fi

  printf '\n完了しました。\n'
  printf 'PR: %s\n' "${pr_url}"
  if [[ "${branch_created}" -eq 1 ]]; then
    printf '作成ブランチ: %s\n' "${target_branch}"
  fi
}

main "$@"
