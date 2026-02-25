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
- デフォルトブランチへ直接コミットしない。
- 失敗した時点で処理を止める。
- 明示依頼がない限り、`git reset --hard`、`git push --force`、`rm` を実行しない。

## 手順

1. 前提条件を確認する。
2. `git` と `gh` の利用可否を確認する。
3. `gh auth status` が成功することを確認する。
4. `origin` リモートが存在することを確認する。
5. 現在ブランチ名を取得する。
6. `gh pr list --head "<current_branch>" --state open --json number,title,url --limit 1` で既存 open PR を検出する。
7. 既存 open PR がある場合は PR 番号を `existing_pr_number` に格納する。
8. 既存 open PR がない場合は `existing_pr_number` を空にする。
9. `existing_pr_number` が空の場合だけ、`origin/HEAD` から base ブランチ名を解決する。
10. `origin/HEAD` が取れない場合は base を `main` にする。
11. `existing_pr_number` が空の場合だけ、作業内容から `kind` を 1 つ選ぶ。
12. `existing_pr_number` が空の場合だけ、変更ファイルのトップレベルが 1 つなら `scope` を推定する。
13. `scope` は `a-z0-9-` に正規化する。
14. `existing_pr_number` が空の場合だけ、変更要約から英語の `slug` を作る。
15. `slug` は `a-z0-9-` の 2〜5 語にする。
16. `existing_pr_number` が空の場合だけ `kind/scope/slug` または `kind/slug` の新規ブランチを作成する。
17. 同名ブランチがローカルまたは `origin` にある場合は末尾に `-2`, `-3` を付けて再生成する。
18. `git add -A` で全変更をステージする。
19. ステージ済み差分が空なら停止する。
20. 差分要約から英語の Conventional Commit 件名を 1 行で作る。
21. コミット件名は 72 文字以内を目安にする。
22. `git commit -m "<subject>"` を実行する。
23. 現在ブランチに upstream がある場合は `git push` を実行する。
24. upstream がない場合は `git push -u origin <current_branch>` を実行する。
25. PR テンプレートを次の順で探索する: `.github/pull_request_template.md`、`.github/PULL_REQUEST_TEMPLATE.md`、`.github/PULL_REQUEST_TEMPLATE/*.md`。
26. `.github/PULL_REQUEST_TEMPLATE/*.md` はファイル名昇順の先頭 1 件を使う。
27. テンプレート本文の日本語文字比率を判定する。
28. 日本語文字が 20 文字以上、または日本語比率が 20% 以上なら日本語優勢と判定する。
29. 日本語優勢なら PR 向け文面を日本語で作る。
30. 日本語優勢でなければ PR 向け文面を英語で作る。
31. `existing_pr_number` が空の場合は新規 PR 作成フローを実行する。
32. 英語の場合は最新コミット件名を PR タイトルに使う。
33. 日本語の場合は差分要約から日本語タイトルを生成する。
34. テンプレートがある場合はテンプレート本文を下敷きにして PR 本文を作る。
35. テンプレート内の `TODO`、`N/A`、`<...>` の未入力箇所を今回の変更内容で埋める。
36. テンプレートがない場合は標準セクションで PR 本文を作る。
37. 英語標準セクションは `Summary`、`Changes`、`Testing` を使う。
38. 日本語標準セクションは `概要`、`変更内容`、`テスト` を使う。
39. PR 本文を一時ファイルへ保存して `gh pr create` に渡す。
40. `gh pr create --base <base> --head <branch> --title "<title>" --body-file <file>` を実行する。
41. `existing_pr_number` がある場合は既存 PR 更新フローを実行する。
42. コメント本文を `Summary/Changes/Testing` または `概要/変更内容/テスト` で作る。
43. コメント本文を一時ファイルへ保存して `gh pr comment <number> --body-file <file>` を実行する。

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
# 1) 現在ブランチと既存 PR 検出
current_branch="$(git branch --show-current)"
existing_pr_number="$(gh pr list --head "${current_branch}" --state open --json number --jq '.[0].number // empty' --limit 1)"

# 2) 既存 PR がない場合だけ新規ブランチを作成
if [[ -z "${existing_pr_number}" ]]; then
  base_branch="$(git symbolic-ref --quiet --short refs/remotes/origin/HEAD 2>/dev/null | sed 's|^origin/||')"
  if [[ -z "${base_branch}" ]]; then
    base_branch="main"
  fi

  git switch -c "${new_branch}"
  current_branch="${new_branch}"
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
  gh pr comment "${existing_pr_number}" --body-file "${pr_comment_file}"
else
  gh pr create --base "${base_branch}" --head "${current_branch}" --title "${pr_title}" --body-file "${pr_body_file}"
fi
```
