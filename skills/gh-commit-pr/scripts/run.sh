#!/usr/bin/env bash
set -euo pipefail

ALLOWED_KINDS=(feat fix docs style refactor perf test build ci chore revert)
AUTO_BEGIN="<!-- AUTO-GENERATED:BEGIN -->"
AUTO_END="<!-- AUTO-GENERATED:END -->"

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

get_default_branch() {
  local ref
  ref="$(git symbolic-ref --quiet --short refs/remotes/origin/HEAD 2>/dev/null || true)"
  if [[ -n "${ref}" ]]; then
    printf '%s' "${ref#origin/}"
    return
  fi

  if git show-ref --verify --quiet refs/remotes/origin/main || git show-ref --verify --quiet refs/heads/main; then
    printf 'main'
    return
  fi

  if git show-ref --verify --quiet refs/remotes/origin/master || git show-ref --verify --quiet refs/heads/master; then
    printf 'master'
    return
  fi

  printf 'main'
}

branch_exists_locally() {
  local branch="$1"
  git show-ref --verify --quiet "refs/heads/${branch}" && return 0
  git show-ref --verify --quiet "refs/remotes/origin/${branch}" && return 0
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

find_open_pr_number_by_head() {
  local branch="$1"
  local repo_owner="$2"
  local number
  number="$(gh pr list --state open --json number,headRefName,headRepositoryOwner --jq "[.[] | select(.headRefName==\"${branch}\" and .headRepositoryOwner != null and .headRepositoryOwner.login==\"${repo_owner}\")] | if length == 1 then .[0].number elif length == 0 then \"\" else \"AMBIGUOUS\" end" 2>/dev/null || true)"
  if [[ "${number}" == "null" ]]; then
    number=""
  fi
  printf '%s' "${number}"
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

  if git rev-parse --verify --quiet "origin/${base_branch}" >/dev/null 2>&1; then
    printf 'origin/%s' "${base_branch}"
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
  local commit_lines
  local file_lines

  if [[ -n "${base_ref}" ]]; then
    diff_summary="$(git diff --shortstat "${base_ref}...HEAD" 2>/dev/null || true)"
    commit_lines="$(git log --no-merges --pretty='- %h %s' "${base_ref}..HEAD" 2>/dev/null || true)"
    file_lines="$(git diff --name-only "${base_ref}...HEAD" 2>/dev/null | sed 's/^/- /' || true)"
  else
    diff_summary=""
    commit_lines="$(git log --no-merges --pretty='- %h %s' -n 20 HEAD 2>/dev/null || true)"
    file_lines="$(git show --pretty='' --name-only HEAD 2>/dev/null | sed 's/^/- /' || true)"
  fi

  if [[ -z "${diff_summary}" ]]; then
    diff_summary="差分サマリーを取得できませんでした。"
  fi
  if [[ -z "${commit_lines}" ]]; then
    commit_lines="- コミット情報を取得できませんでした。"
  fi
  if [[ -z "${file_lines}" ]]; then
    file_lines="- 変更ファイル情報を取得できませんでした。"
  fi

  cat <<EOF
${AUTO_BEGIN}
## 背景
- ブランチ \`${branch_name}\` の変更を \`${base_branch}\` に取り込みます。

## 変更内容
- ${diff_summary}
${commit_lines}

## 確認観点
${file_lines}

## 影響範囲
- 上記ファイルに関連する機能に影響します。
${AUTO_END}
EOF
}

merge_body_with_auto() {
  local current_body="$1"
  local auto_section="$2"
  local body_file
  local auto_file
  local output_file

  body_file="$(mktemp)"
  auto_file="$(mktemp)"
  output_file="$(mktemp)"

  printf '%s' "${current_body}" > "${body_file}"
  printf '%s' "${auto_section}" > "${auto_file}"

  if grep -Fq "${AUTO_BEGIN}" "${body_file}" && grep -Fq "${AUTO_END}" "${body_file}"; then
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

  cat "${output_file}"
  rm -f "${body_file}" "${auto_file}" "${output_file}"
}

main() {
  local current_branch
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
  local existing_pr_title
  local existing_pr_base
  local pr_title
  local has_changes
  local push_mode
  local body_source
  local auto_section
  local merged_body
  local base_ref
  local body_file
  local pr_url
  local template_path
  local english_policy_issues=()
  local repo_owner

  require_command git
  require_command gh

  if ! gh auth status >/dev/null 2>&1; then
    print_error "gh の認証状態を確認できません。先に 'gh auth login' を実行してください。"
    exit 1
  fi

  repo_owner="$(gh repo view --json owner --jq '.owner.login' 2>/dev/null || true)"
  if [[ -z "${repo_owner}" || "${repo_owner}" == "null" ]]; then
    print_error "リポジトリ owner を取得できません。gh のアクセス権を確認してください。"
    exit 1
  fi

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

  default_branch="$(get_default_branch)"
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
    if branch_exists_locally "${target_branch}"; then
      target_branch="${target_branch}-$(date +%Y%m%d%H%M%S)"
      printf '同名ブランチがあるため、`%s` を使用します。\n' "${target_branch}"
    fi
  fi

  existing_pr_number="$(find_open_pr_number_by_head "${target_branch}" "${repo_owner}")"
  if [[ "${existing_pr_number}" == "AMBIGUOUS" ]]; then
    print_error "同一 owner/head の open PR が複数見つかりました。対象PRを手動で整理してから再実行してください。"
    exit 1
  fi
  existing_pr_title=""
  existing_pr_base=""
  if [[ -n "${existing_pr_number}" ]]; then
    existing_pr_title="$(gh pr view "${existing_pr_number}" --json title --jq '.title')"
    existing_pr_base="$(gh pr view "${existing_pr_number}" --json baseRefName --jq '.baseRefName')"
  fi

  base_branch="${existing_pr_base:-${default_branch}}"
  base_branch="$(prompt_required "base branch" "${base_branch}")"
  pr_title="$(prompt_required "PR title" "${existing_pr_title:-${subject}}")"

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

  if [[ "${current_branch}" == "${default_branch}" ]]; then
    git checkout -b "${target_branch}"
    branch_created=1
  fi

  git add -A
  if git diff --cached --quiet; then
    printf 'ステージされた変更がありません。処理を終了します。\n'
    exit 0
  fi

  git commit -m "${commit_message}"

  push_mode="normal"
  if ! git rev-parse --abbrev-ref --symbolic-full-name '@{upstream}' >/dev/null 2>&1; then
    push_mode="with-upstream"
  fi

  if [[ "${push_mode}" == "with-upstream" ]]; then
    git push -u origin "${target_branch}"
  else
    git push
  fi

  existing_pr_number="$(find_open_pr_number_by_head "${target_branch}" "${repo_owner}")"
  if [[ "${existing_pr_number}" == "AMBIGUOUS" ]]; then
    print_error "同一 owner/head の open PR が複数見つかりました。PR更新を中断します。"
    exit 1
  fi
  base_ref="$(resolve_base_ref "${base_branch}")"
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

  merged_body="$(merge_body_with_auto "${body_source}" "${auto_section}")"
  body_file="$(mktemp)"
  printf '%s\n' "${merged_body}" > "${body_file}"

  if [[ -n "${existing_pr_number}" ]]; then
    gh pr edit "${existing_pr_number}" --base "${base_branch}" --title "${pr_title}" --body-file "${body_file}"
    pr_url="$(gh pr view "${existing_pr_number}" --json url --jq '.url')"
  else
    pr_url="$(gh pr create --base "${base_branch}" --head "${target_branch}" --title "${pr_title}" --body-file "${body_file}")"
  fi

  rm -f "${body_file}"

  printf '\n完了しました。\n'
  printf 'PR: %s\n' "${pr_url}"
  if [[ "${branch_created}" -eq 1 ]]; then
    printf '作成ブランチ: %s\n' "${target_branch}"
  fi
}

main "$@"
