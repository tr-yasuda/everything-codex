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
- 現在ブランチに紐づく `open` PR がある場合は、ブランチ名を変更しない。
- 現在ブランチに紐づく `open` PR がある場合は、`gh pr create` を実行しない。
- 現在ブランチに紐づく `open` PR がある場合は、`gh pr comment` で修正内容を 1 件追記する。
- PR タイトルと本文は原則英語で作成する。
- PR コメント本文は原則英語で作成する。
- PR テンプレートが日本語優勢の場合のみ、PR タイトル・本文・コメント本文を日本語で作成する。
- 書き込み操作（`git switch -c`、`git commit`、`git push`、`gh pr create`、`gh pr comment`）の前に必ず `Preflight` を完了する。
- `gh` 疎通確認（`gh api rate_limit` など）が失敗した場合は、承認付きで 1 回だけ再実行する。
- `gh` 疎通確認の再実行が失敗した場合は停止し、失敗時テンプレートで報告する。
- デフォルトブランチへ直接コミットしない。
- 失敗した時点で処理を止める。
- 明示依頼がない限り、`git reset --hard`、`git push --force`、`rm` を実行しない。

## 実行モード

- `normal`: 通常実行。コミット、push、PR 作成または PR コメント更新まで行う。
- `preflight-only`: 前提確認だけ行い、書き込み操作を行わない。
- `dry-run`: 前提確認後に「予定ブランチ名、予定コミット件名、予定 PR 文面」を提示して停止する。

## 手順

1. 実行モードを決定する。指定がなければ `normal` にする。
2. `git` と `gh` の利用可否を確認する。
3. `origin` リモートが存在することを確認する。
4. `gh auth status` が成功することを確認する。
5. `gh api rate_limit --jq '.rate.remaining'` を実行して API 疎通を確認する。
6. 手順 4 または 5 が失敗した場合は、承認付きで同じコマンドを 1 回だけ再実行する。
7. 再実行でも失敗した場合は、失敗時テンプレートで報告して停止する。
8. 現在ブランチ名を取得する。
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
19. 差分要約から英語の Conventional Commit 件名を 1 行で作る。72 文字以内を目安にする。
20. PR テンプレートを次の順で探索する: `.github/pull_request_template.md`、`.github/PULL_REQUEST_TEMPLATE.md`、`.github/PULL_REQUEST_TEMPLATE/*.md`。
21. `.github/PULL_REQUEST_TEMPLATE/*.md` はファイル名昇順の先頭 1 件を使う。
22. テンプレート本文の日本語文字比率を判定し、日本語優勢なら日本語文面、そうでなければ英語文面を作る。
23. `dry-run` の場合は、予定ブランチ名、予定コミット件名、予定 PR タイトルと本文案を出力して停止する。
24. `existing_pr_number` が空の場合だけ `git switch -c "<new_branch>"` を実行する。
25. `git add -A` で全変更をステージする。
26. ステージ済み差分が空なら停止する。
27. `git commit -m "<subject>"` を実行する。
28. 現在ブランチに upstream がある場合は `git push` を実行する。ない場合は `git push -u origin <current_branch>` を実行する。
29. `existing_pr_number` が空の場合は `gh pr create --base <base> --head <branch> --title "<title>" --body-file <file>` を実行する。
30. `existing_pr_number` がある場合は `gh pr comment <number> --body-file <file>` を実行する。

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

# 0) Preflight
command -v git >/dev/null || { echo "git not found"; exit 1; }
command -v gh >/dev/null || { echo "gh not found"; exit 1; }
git remote get-url origin >/dev/null || { echo "origin not found"; exit 1; }

gh auth status || gh auth status || exit 1
gh api rate_limit --jq '.rate.remaining' >/dev/null || gh api rate_limit --jq '.rate.remaining' >/dev/null || exit 1

# 0.5) preflight-only
if [[ "${mode}" == "preflight-only" ]]; then
  echo "preflight ok"
  exit 0
fi

# 0) 手順で作った入力値を準備
# kind: feat|fix|docs|style|refactor|perf|test|build|ci|chore
# scope: optional
# slug: kebab-case summary
# commit_subject: conventional commit subject
if [[ -z "${commit_subject:-}" ]]; then
  commit_subject="chore: update"
fi

# 1) 現在ブランチと既存 PR 検出
current_branch="$(git branch --show-current)"
existing_pr_number="$(gh pr list --head "${current_branch}" --state open --json number --jq '.[0].number // empty' --limit 1)"

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

# dry-run はここで停止
if [[ "${mode}" == "dry-run" ]]; then
  echo "branch=${current_branch}"
  echo "commit=${commit_subject}"
  echo "dry-run: skip commit/push/pr"
  exit 0
fi

# 2.5) 既存 PR がない場合だけ新規ブランチを作成
if [[ -z "${existing_pr_number}" ]]; then
  git switch -c "${current_branch}"
fi

# 3) ステージとコミット
git add -A
git diff --cached --quiet && { echo "No staged changes"; exit 1; }
git commit -m "${commit_subject}"

# 4) push（upstream があれば通常 push）
if git rev-parse --abbrev-ref --symbolic-full-name '@{u}' >/dev/null 2>&1; then
  git push
else
  git push -u origin "${current_branch}"
fi

# 5) 既存 PR があればコメント、なければ新規 PR 作成
if [[ -n "${existing_pr_number}" ]]; then
  pr_comment_file="$(mktemp)"
  cat > "${pr_comment_file}" <<'EOF'
Summary
- Describe the fix.
Changes
- List key file-level changes.
Testing
- Describe executed tests and outcomes.
EOF

  # 日本語テンプレートを使う場合は見出しを `概要/変更内容/テスト` に置き換える。
  gh pr comment "${existing_pr_number}" --body-file "${pr_comment_file}"
else
  pr_title="${commit_subject}"
  pr_body_file="$(mktemp)"
  cat > "${pr_body_file}" <<'EOF'
Summary
- Describe the change.
Changes
- List key file-level changes.
Testing
- Describe executed tests and outcomes.
EOF

  # 日本語テンプレートを使う場合は見出しを `概要/変更内容/テスト` に置き換える。
  gh pr create --base "${base_branch}" --head "${current_branch}" --title "${pr_title}" --body-file "${pr_body_file}"
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
