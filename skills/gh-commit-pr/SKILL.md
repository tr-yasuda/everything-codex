---
name: gh-commit-pr
description: Git の作業ブランチ作成、Conventional Commits 形式のコミット、origin への push、GitHub Pull Request 作成を一括で行う skill。現在ブランチに紐づく open PR がすでにある場合は同じブランチでコミットと push のみ行い、PR コメントで修正内容を追記する。ユーザーが「コミットして」「push して」「PR を作って」「既存PRを更新して」など、コミットから PR 更新までの連続作業を依頼したときに使う。
---

# gh-commit-pr

## 固定ルール

- `kind` は次の固定列挙のみ許可する: `feat|fix|docs|style|refactor|perf|test|build|ci|chore`。
- 新規ブランチ名は `kind/scope/slug` または `kind/slug` に固定する。
- コミットメッセージは英語で作成する。
- コミット形式は `kind(scope): message` または `kind: message` に固定する。
- コミット粒度は「1コミット = 1意図」に固定する。
- 独立した意図が複数ある差分は、意図単位で複数コミットに分割する。
- 意図分割が不可能な場合だけ例外として 1 コミットにまとめ、理由を `split_exception_reason` として残す。
- PR 本文または PR コメントには `Commit Intent Map`（各コミットの意図一覧）を必ず含める。
- 現在ブランチに紐づく `open` PR がある場合は、ブランチ名を変更しない。
- 現在ブランチに紐づく `open` PR がある場合は、`gh pr create` を実行しない。
- 現在ブランチに紐づく `open` PR がある場合は、`gh pr comment` で修正内容を 1 件追記する。
- PR タイトルと本文は原則英語で作成する。
- PR コメント本文は原則英語で作成する。
- PR テンプレートが日本語優勢の場合のみ、PR タイトル・本文・コメント本文を日本語で作成する。
- 書き込み操作（`git switch -c`、`git commit`、`git push`、`gh pr create`、`gh pr comment`）の前に必ず `Preflight` を完了する。
- `gh` コマンド（`gh auth status`、`gh api rate_limit`、`gh pr list`、`gh pr create`、`gh pr comment`）が失敗した場合は、承認付きで 1 回だけ再実行する。
- 承認付き再実行では `GH_RETRY_GH_ONCE=1` を使って 1 回だけ再試行する。
- `gh` コマンドの再実行が失敗した場合は停止し、失敗時テンプレートで報告する。
- PR 本文と PR コメント本文は、インライン展開ではなく必ず `--body-file` で送る。
- デフォルトブランチへ直接コミットしない。
- 失敗した時点で処理を止める。
- 明示依頼がない限り、`git reset --hard`、`git push --force`、`rm` を実行しない。

## 実行モード

- `normal`: 通常実行。コミット、push、PR 作成または PR コメント更新まで行う。
- `preflight-only`: 前提確認だけ行い、書き込み操作を行わない。
- `dry-run`: 前提確認後に「予定ブランチ名、予定コミット一覧、予定 PR タイトル/本文または予定 PR コメント本文」を提示して停止する。

## 手順

1. 実行モードを決定する。指定がなければ `normal` にする。
2. `git` と `gh` の利用可否を確認する。
3. `origin` リモートが存在することを確認する。
4. `gh auth status` が成功することを確認する。
5. `gh api rate_limit --jq '.rate.remaining'` を実行して API 疎通を確認する。
6. 手順 4 以降で実行する `gh` コマンドが失敗した場合は、承認付きで `GH_RETRY_GH_ONCE=1` を付けて同じコマンドを 1 回だけ再実行する。
7. 再実行でも失敗した場合は、失敗時テンプレートで報告して停止する。
8. 現在ブランチ名を取得する（必要なら事前に `git fetch --prune origin` で同期する）。
9. `gh pr list --head "<current_branch>" --state open --json number,title,url --limit 1` で既存 open PR を検出する。
10. 既存 open PR がある場合は PR 番号を `existing_pr_number` に格納する。ない場合は空にする。
11. `preflight-only` の場合は、確認結果を出力して停止する。
12. `existing_pr_number` が空の場合だけ、`origin/HEAD` から base ブランチ名を解決する。取れない場合は `main` にする。
13. `existing_pr_number` が空の場合だけ、作業内容から `kind` を 1 つ選ぶ。
14. `existing_pr_number` が空の場合だけ、変更ファイルのトップレベルが 1 つなら `scope` を推定する。
15. `scope` は `a-z0-9-` に正規化する。
16. `existing_pr_number` が空の場合だけ、変更要約から英語の `slug` を作る。
17. `slug` は `a-z0-9-` の 2〜5 語にする。
18. `existing_pr_number` が空の場合だけ、同名ブランチ衝突回避を行って `kind/scope/slug` または `kind/slug` の候補名を決定する。
19. 差分を意図単位で分類し、`commit_units`（`subject`、`staging_scope`、`intent`）を作る。
20. 独立した意図が複数ある場合は、`commit_units` の各要素を 1 コミットずつ作成する。
21. 意図分割が不可能な場合だけ、`split_exception_reason` を記録して 1 コミットにまとめる。
22. PR テンプレートを次の順で探索する: `.github/pull_request_template.md`、`.github/PULL_REQUEST_TEMPLATE.md`、`.github/PULL_REQUEST_TEMPLATE/*.md`。
23. `.github/PULL_REQUEST_TEMPLATE/*.md` はファイル名昇順の先頭 1 件を使う。
24. テンプレート本文の日本語文字比率を判定し、日本語優勢なら日本語文面、そうでなければ英語文面を作る。
25. `dry-run` の場合は、予定ブランチ名、予定コミット一覧、予定 PR タイトルと本文案（既存 PR がある場合は予定 PR コメント本文）を出力して停止する。
26. `existing_pr_number` が空の場合だけ `git switch -c "<new_branch>"` を実行する。
27. `commit_units` に従って、意図単位で `git add` と `git commit` を繰り返す。例外時のみ 1 コミットで実行する。
28. 各コミット後に `Commit Intent Map` を更新する。
29. 現在ブランチに upstream がある場合は `git push` を実行する。ない場合は `git push -u origin <current_branch>` を実行する。
30. `existing_pr_number` が空の場合は `gh pr create --base <base> --head <branch> --title "<title>" --body-file <file>` を実行する。
31. `existing_pr_number` がある場合は `gh pr comment <number> --body-file <file>` を実行する。
32. `split_exception_reason` がある場合は、PR 本文または PR コメントに理由を必ず記載する。

## `kind` 選択ガイド

- 新機能追加は `feat` にする。
- 不具合修正は `fix` にする。
- ドキュメント変更のみは `docs` にする。
- 意味変更なしの整形は `style` にする。
- 振る舞い維持の再構成は `refactor` にする。
- 性能改善は `perf` にする。
- テスト追加や修正は `test` にする。
- ビルド設定や依存管理は `build` にする。
- CI 設定は `ci` にする。
- 雑務や保守作業は `chore` にする。

## 実行時テンプレート

```bash
# mode: normal|preflight-only|dry-run
mode="${mode:-normal}"
allow_retry_once="${GH_RETRY_GH_ONCE:-0}"

run_gh() {
  if gh "$@"; then
    return 0
  fi

  if [[ "${allow_retry_once}" == "1" || "${allow_retry_once}" == "true" ]]; then
    gh "$@"
    return $?
  fi

  echo "gh $* failed. set GH_RETRY_GH_ONCE=1 after approval to retry once." >&2
  return 1
}

# 0) Preflight
command -v git >/dev/null || { echo "git not found"; exit 1; }
command -v gh >/dev/null || { echo "gh not found"; exit 1; }
git remote get-url origin >/dev/null || { echo "origin not found"; exit 1; }

current_branch="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "")"
[[ -z "${current_branch}" ]] && { echo "failed to detect current branch"; exit 1; }

default_branch="$(git symbolic-ref --quiet --short refs/remotes/origin/HEAD 2>/dev/null | sed 's|^origin/||')"
[[ -z "${default_branch}" ]] && default_branch="main"

run_gh auth status || exit 1
run_gh api rate_limit --jq '.rate.remaining' >/dev/null || exit 1

# 0) 手順で作った入力値を準備
# kind: feat|fix|docs|style|refactor|perf|test|build|ci|chore
# scope: optional
# slug: kebab-case summary
# commit_subject: conventional commit subject
# commit_plan_file: optional, one line per commit as "<subject>|<staging_scope>|<intent>"
# split_exception_reason: optional, required only when mixed-intent single commit is unavoidable
if [[ -z "${commit_subject:-}" ]]; then
  commit_subject="chore: update"
fi
commit_plan_file="${commit_plan_file:-}"
split_exception_reason="${split_exception_reason:-}"
commit_intent_map=""
split_exception_note="none"

# 1) 現在ブランチと既存 PR 検出
existing_pr_number="$(run_gh pr list --head "${current_branch}" --state open --json number --jq '.[0].number // empty' --limit 1)" || exit 1

# 1.0) preflight-only（既存 PR 検出まで実行してから終了）
if [[ "${mode}" == "preflight-only" ]]; then
  echo "preflight ok: branch=${current_branch} default_branch=${default_branch} existing_pr_number=${existing_pr_number:-none}"
  exit 0
fi

# 1.1) 既存 PR がある状態で default branch なら停止
if [[ -n "${existing_pr_number}" && "${current_branch}" == "${default_branch}" ]]; then
  echo "current branch '${current_branch}' is default branch '${default_branch}'; direct commits are not allowed"
  exit 1
fi

# 2) 既存 PR がない場合だけ新規ブランチを作成
if [[ -z "${existing_pr_number}" ]]; then
  : "${kind:?kind is required}"
  : "${slug:?slug is required}"

  new_branch="${kind}/${slug}"
  if [[ -n "${scope:-}" ]]; then
    new_branch="${kind}/${scope}/${slug}"
  fi

  base_branch="$(git symbolic-ref --quiet --short refs/remotes/origin/HEAD 2>/dev/null | sed 's|^origin/||')"
  if [[ -z "${base_branch}" ]]; then
    base_branch="main"
  fi

  current_branch="${new_branch}"
fi

# 2.1) PR テンプレート探索と言語判定
template_file=""
if [[ -f .github/pull_request_template.md ]]; then
  template_file=".github/pull_request_template.md"
elif [[ -f .github/PULL_REQUEST_TEMPLATE.md ]]; then
  template_file=".github/PULL_REQUEST_TEMPLATE.md"
elif compgen -G '.github/PULL_REQUEST_TEMPLATE/*.md' > /dev/null; then
  template_file="$(find .github/PULL_REQUEST_TEMPLATE -maxdepth 1 -type f -name '*.md' | sort | head -n 1)"
fi

lang="en"
if [[ -n "${template_file}" ]]; then
  jp_chars="$(tr -cd 'ぁ-んァ-ヶ一-龠々ー' < "${template_file}" | wc -m | tr -d ' ')"
  total_chars="$(wc -m < "${template_file}" | tr -d ' ')"
  jp_ratio=0
  if [[ "${total_chars}" -gt 0 ]]; then
    jp_ratio=$(( jp_chars * 100 / total_chars ))
  fi
  if [[ "${jp_chars}" -ge 20 || "${jp_ratio}" -ge 20 ]]; then
    lang="ja"
  fi
fi

# 2.2) PR 文面準備
if [[ -n "${existing_pr_number}" ]]; then
  pr_comment_file="$(mktemp)"
  if [[ "${lang}" == "ja" ]]; then
    cat > "${pr_comment_file}" <<'EOF'
概要
- 修正内容を記述してください。
変更内容
- 主なファイル単位の変更点を列挙してください。
テスト
- 実施したテストと結果を記述してください。
EOF
  else
    cat > "${pr_comment_file}" <<'EOF'
Summary
- Describe the fix.
Changes
- List key file-level changes.
Testing
- Describe executed tests and outcomes.
EOF
  fi
else
  pr_title="${commit_subject}"
  pr_body_file="$(mktemp)"
  if [[ -n "${template_file}" ]]; then
    cp "${template_file}" "${pr_body_file}"
    if [[ "${lang}" == "ja" ]]; then
      cat >> "${pr_body_file}" <<'EOF'

---

概要
- 変更内容を記述してください。
変更内容
- 主なファイル単位の変更点を列挙してください。
テスト
- 実施したテストと結果を記述してください。
EOF
    else
      cat >> "${pr_body_file}" <<'EOF'

---

Summary
- Describe the change.
Changes
- List key file-level changes.
Testing
- Describe executed tests and outcomes.
EOF
    fi
  else
    if [[ "${lang}" == "ja" ]]; then
      cat > "${pr_body_file}" <<'EOF'
概要
- 変更内容の概要を記述してください。
変更内容
- 主なファイル単位の変更点を列挙してください。
テスト
- 実施したテストと結果を記述してください。
EOF
    else
      cat > "${pr_body_file}" <<'EOF'
Summary
- Describe the change.
Changes
- List key file-level changes.
Testing
- Describe executed tests and outcomes.
EOF
    fi
  fi
fi

# dry-run はここで停止
if [[ "${mode}" == "dry-run" ]]; then
  echo "branch=${current_branch}"
  if [[ -n "${commit_plan_file}" ]]; then
    echo "planned_commits:"
    cat "${commit_plan_file}"
  else
    echo "planned_commit=${commit_subject}"
  fi
  if [[ -n "${split_exception_reason}" ]]; then
    echo "split_exception_reason=${split_exception_reason}"
  fi
  if [[ -n "${existing_pr_number}" ]]; then
    echo "existing_pr_number=${existing_pr_number}"
    echo "planned_pr_comment_body:"
    cat "${pr_comment_file}"
  else
    echo "planned_pr_title=${pr_title}"
    echo "planned_pr_body:"
    cat "${pr_body_file}"
  fi
  echo "dry-run: skip commit/push/pr create/comment"
  exit 0
fi

# 2.5) 既存 PR がない場合だけ新規ブランチを作成
if [[ -z "${existing_pr_number}" ]]; then
  git switch -c "${current_branch}"
fi

# 3) コミット（1コミット = 1意図）
if [[ -n "${commit_plan_file}" ]]; then
  while IFS='|' read -r unit_subject unit_scope unit_intent; do
    [[ -z "${unit_subject}" ]] && continue
    [[ -z "${unit_scope}" ]] && { echo "empty staging_scope for ${unit_subject}"; exit 1; }
    IFS=' ' read -r -a unit_scope_parts <<< "${unit_scope}"
    git add -- "${unit_scope_parts[@]}"
    git diff --cached --quiet && { echo "No staged changes for ${unit_subject}"; exit 1; }
    git commit -m "${unit_subject}"
    short_sha="$(git rev-parse --short HEAD)"
    commit_intent_map="${commit_intent_map}- ${short_sha}: ${unit_intent}"$'\n'
  done < "${commit_plan_file}"
else
  if [[ -n "${split_exception_reason}" ]]; then
    split_exception_note="${split_exception_reason}"
  fi
  git add -A
  git diff --cached --quiet && { echo "No staged changes"; exit 1; }
  git commit -m "${commit_subject}"
  short_sha="$(git rev-parse --short HEAD)"
  if [[ -n "${split_exception_reason}" ]]; then
    commit_intent_map="${commit_intent_map}- ${short_sha}: mixed-intent commit (${split_exception_reason})"$'\n'
  else
    commit_intent_map="${commit_intent_map}- ${short_sha}: ${commit_subject}"$'\n'
  fi
fi

[[ -n "${commit_intent_map}" ]] || { echo "commit_intent_map is empty"; exit 1; }

# 3.1) PR 本文/コメントに Commit Intent Map と例外理由を追記
if [[ -n "${existing_pr_number}" ]]; then
  if [[ "${lang}" == "ja" ]]; then
    cat >> "${pr_comment_file}" <<EOF

コミット意図
${commit_intent_map}
分割例外
- ${split_exception_note}
EOF
  else
    cat >> "${pr_comment_file}" <<EOF

Commit Intent Map
${commit_intent_map}
Split Exception
- ${split_exception_note}
EOF
  fi
else
  if [[ "${lang}" == "ja" ]]; then
    cat >> "${pr_body_file}" <<EOF

コミット意図
${commit_intent_map}
分割例外
- ${split_exception_note}
EOF
  else
    cat >> "${pr_body_file}" <<EOF

Commit Intent Map
${commit_intent_map}
Split Exception
- ${split_exception_note}
EOF
  fi
fi

# 4) push（upstream があれば通常 push）
if git rev-parse --abbrev-ref --symbolic-full-name '@{u}' >/dev/null 2>&1; then
  git push
else
  git push -u origin "${current_branch}"
fi

# 5) 既存 PR があればコメント、なければ新規 PR 作成
if [[ -n "${existing_pr_number}" ]]; then
  run_gh pr comment "${existing_pr_number}" --body-file "${pr_comment_file}"
else
  run_gh pr create --base "${base_branch}" --head "${current_branch}" --title "${pr_title}" --body-file "${pr_body_file}"
fi
```

## 失敗時テンプレート

```text
失敗した工程: <step>
原因: <reason>
再実行可否: <yes/no>
ユーザーが行う最小手順:
1. <command>
2. <command>
3. <command>
```
