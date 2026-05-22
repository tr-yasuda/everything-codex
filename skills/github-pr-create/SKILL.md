---
name: github-pr-create
description:
  GitHub で PR (Pull Request) を作成または更新するための skill です。
---

# GitHub PR Create

## 目的

現在のブランチの変更内容を確認し、レビューできる状態に整えてから
GitHub Pull Request を作成または更新する。
PR 本文は変更ログではなく、レビューする人への案内文として書く。

初見の人が、変更の目的、主な内容、確認済みのこと、見てほしい点を
理解できる状態にする。
文脈がないと意味がわからない補足や、内輪向けの説明は入れない。

## 作成・更新前の確認

### ブランチと変更

PR に出したい変更だけが含まれているかを確認する。
作業途中のメモ、不要な設定変更、別件の修正が混ざっている場合は整理する。
default ブランチはリポジトリごとに違うため、思い込みで決めない。

```bash
git status --short
git symbolic-ref --short HEAD
git symbolic-ref --short refs/remotes/origin/HEAD
```

### 既存 PR

同じブランチからすでに PR が作られていないか確認する。
既存 PR がある場合は、新しい PR を作らず、その PR を更新する。

```bash
gh pr list --head $(git symbolic-ref --short HEAD)
```

### default ブランチの取り込み

必要であれば、default ブランチの最新状態を取り込む。
競合が起きた場合は、次のステップへ進む前に手元で解決する。

```bash
git fetch origin
git merge $(git symbolic-ref --short refs/remotes/origin/HEAD)
```

### 差分と commit

PR 本文を書く前に、変更内容を自分で読み直す。
目的はコマンド結果を貼ることではなく、伝えるべきことを整理することです。

```bash
git --no-pager log \
  $(git symbolic-ref --short refs/remotes/origin/HEAD)..HEAD --oneline
git --no-pager diff \
  $(git symbolic-ref --short refs/remotes/origin/HEAD)...HEAD --stat
git --no-pager diff \
  $(git symbolic-ref --short refs/remotes/origin/HEAD)...HEAD
```

- 意図しない変更が含まれていないか
- レビューしづらい巨大変更になっていないか
- テスト追加が必要な変更か
- 既存の使い方に影響する変更が含まれていないか
- ドキュメント更新が必要な変更か

### 必要な確認

コードを変更した場合は、レビュー依頼前に必要な確認を済ませる。
実行する内容はリポジトリのルールに従う。
確認できなかった項目がある場合は、理由を PR 本文に書く。

- フォーマットが崩れていないか
- 実行時に明らかなエラーが出ないか
- テストが通るか
- 変更に合わせてドキュメントも更新されているか

ドキュメントのみの変更では、PR 作成のためだけに重い確認をしない。

## PR 本文の書き方

PR 本文は、レビューする人に向けた案内文として書く。
変更したファイルの一覧や commit の羅列だけでは不十分です。

`.github/pull_request_template.md` または
`.github/PULL_REQUEST_TEMPLATE.md` が存在する場合は、必ずその内容を使う。
不要に見える項目があっても削除せず、該当しない理由を書く。

PR 本文を `gh pr create` などの CLI 引数へ直接埋め込んではならない。
必ず `/tmp` ディレクトリ配下に Markdown ファイルを作り、
そのファイルを PR 本文として渡す。

```bash
PR_BODY_FILE="/tmp/$(git symbolic-ref --short HEAD)-pr-body.md"
```

本文には、少なくとも次の内容を含める。

- PR の目的
- 変更内容の概要
- なぜこの変更が必要か
- どう対応したか
- テストの実行結果
- レビュワーに見てほしい点
- 未対応事項や注意点

`Summary`、`Changes`、`Verification`、`Notes` の順に書くと読みやすい。
目的と背景、主な変更と対応方針、実行した確認と結果、
レビュワーに見てほしい点や未対応事項を分けて書く。
注意点がない場合は「特になし」と明記する。

## PR 本文で避けること

PR 本文は、レビューする人が判断するための文章です。
そのため、次の書き方は禁止する。

- diff をそのまま貼り付ける
- commit message を並べただけにする
- 実行していないテストを「実行済み」と書く
- 確認していないことを断定する
- 「いくつか」「様々な」など、曖昧な表現で済ませる

数や範囲がわかる場合は、具体的に書く。
まだ確認できていない場合は、確認できていないと書く。

## PR タイトルと作成方法

PR は、基本的に draft として作成する。

PR タイトルは、次の形式にする。

```text
type(scope): description
```

`scope` は任意です。
`description` には、変更内容がレビュワーに一目で伝わる説明を書く。

`type` は `feat`、`fix`、`docs`、`style`、`refactor`、`perf`、
`test`、`chore`、`ci`、`revert` のいずれかにする。

作成時は、本文ファイルを指定して draft PR を作る。

```bash
gh pr create --draft \
  --title "docs(skills): improve PR creation guidance" \
  --body-file "$PR_BODY_FILE"
```

既存 PR を更新する場合も、本文は Markdown ファイルで用意してから反映する。

```bash
gh pr edit --body-file "$PR_BODY_FILE"
```

既存 PR を更新するときは、本文も今の差分に合わせて直す。
確認結果、注意点、レビューしてほしい観点が古いままになっていないか見る。
更新内容が大きい場合は、コメントで何を更新したかを短く補足する。
