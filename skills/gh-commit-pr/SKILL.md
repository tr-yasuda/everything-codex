---
name: gh-commit-pr
description: ユーザーが gh を使って git commit・git push・GitHub PR の作成または更新を一連で実行したいときに使う。conventional commit の kind/scope、ブランチ命名（kind/slug または kind/scope/slug）、デフォルトブランチ判定、PR テンプレート本文を保持した自動生成セクション同期を適用する。
---

# gh-commit-pr

`scripts/run.sh` を実行し、`commit -> push -> PR作成/更新` を対話形式で進める。

## 実行手順

1. 必須コマンドを確認する。
   - `git`
   - `gh`
2. リポジトリ状態を確認する。
   - 変更がない場合は停止する。
3. conventional commit 入力を確定する。
   - kind は次のいずれかのみ許可する:
     - `feat`
     - `fix`
     - `docs`
     - `style`
     - `refactor`
     - `perf`
     - `test`
     - `build`
     - `ci`
     - `chore`
     - `revert`
   - scope は任意とする。
   - commit message は `kind(scope): subject` または `kind: subject` にする。
4. ブランチを確定する。
   - 現在ブランチがデフォルトブランチなら、新規ブランチを作成する。
   - 形式は `kind/slug` または `kind/scope/slug` にする。
5. `git add -A` と commit を実行する。
6. push を実行する。
   - upstream 未設定なら、設定済みの既定リモートを解決して `git push -u <remote> <branch>` を使う。
   - upstream 設定済みなら `git push` を使う。
7. PR を作成または更新する。
   - 現在チェックアウト中のブランチに紐づく open PR があれば `gh pr edit` を使う。
   - なければ `gh pr create` を使う。
   - `PR title` のデフォルトは `commit message` と同じ形式にする。
8. PR description を同期する。
   - テンプレートがある場合はテンプレート本文を保持する。
   - `<!-- AUTO-GENERATED:BEGIN -->` と `<!-- AUTO-GENERATED:END -->` の区間だけ更新する。
   - 区間がなければ末尾に自動生成セクションを追加する。

## 言語ポリシー

- `commit subject` は英語をデフォルトにする。
- `scope` は英語（英数字）を使う。
- `branch slug` は英語（英数字と `-`）を使う。
- `PR title` は英語をデフォルトにする。
- `PR description` の自動生成セクションは英語を使う。
- テンプレート本文は元の言語を保持する。

## テンプレート探索順

1. `.github/pull_request_template.md`
2. `.github/PULL_REQUEST_TEMPLATE.md`
3. `.github/PULL_REQUEST_TEMPLATE/*.md` の先頭1件

## 実行コマンド

```bash
bash scripts/run.sh
```
