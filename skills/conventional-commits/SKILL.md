---
name: conventional-commits
description: 現在の変更内容を確認し、Conventional Commits 形式で 1 件の
  `git commit` を作成する skill。`git status` や `git diff` を見て type、
  scope、subject を決めたいとき、現在の変更をそのまま conventional commit
  したいとき、差分が 1 つの論点か判断して commit か分割提案へ進みたいときに使う。
---

# Conventional Commits

## Inspect Current Changes First

最初に現在の変更を確認する。

- `git status --short` で対象ファイルを把握する
- `git diff --stat` と `git diff` で変更のまとまりを見る
- すでに stage 済みの差分がある場合は `git diff --cached` も確認する

変更が複数の論点にまたがる場合は、そのまま commit しない。
分けるべきファイル群と commit 候補を提示して止まる。

## Treat Ambiguity As A Stop Signal

次のケースは曖昧扱いにする。

- 複数の type が同じ程度に妥当
- scope が推測頼みになる
- 同じファイルに stage 済みと未 stage の変更が混在する
- どのファイルを 1 件の commit に含めるべきか迷う

曖昧な場合は、対象ファイル一覧と commit message 候補を示し、
確認を取ってから stage や commit に進む。

## Choose One Commit Theme

1 件の commit に対して主題を 1 つ選ぶ。
type は以下から最も近いものを使う。

- `feat`: 新機能の追加
- `fix`: バグ修正
- `docs`: ドキュメントのみの変更
- `style`: 振る舞いに影響しない整形
- `refactor`: 機能追加やバグ修正を伴わない構造変更
- `perf`: 性能改善
- `test`: テストの追加や修正
- `chore`: 補助ツールや依存関係の更新
- `ci`: CI 設定や自動化の変更
- `revert`: 既存コミットの取り消し

scope は任意にする。
リポジトリ内で明確なサブシステム名がある場合だけ付ける。
曖昧な場合は scope を省略する。

## Write The Commit Message

以下の形式で書く。

```text
<type>(<scope>?): <subject>

[<body>]

[<footer>]
```

subject は次の規則で書く。

- 英語の命令形を使う
- 小文字で始める
- 文末に `.` を付けない
- 50 文字前後を目安にし、長くても 72 文字以内に収める
- 変更結果ではなく、行う操作を表す

body は理由や背景が必要なときだけ追加する。
footer は `Fixes #123` や `BREAKING CHANGE:` に使う。

## Commit Non-Interactively

commit する場合は、対象に選んだファイルだけを stage する。
`git add -A` で無関係な変更までまとめない。

`git commit` は対話エディタを開かず、`-m` を使って実行する。
body や footer が必要なら追加の `-m` を使う。

```bash
git commit -m "docs: update contributor guide"
git commit -m "feat(api)!: remove legacy token endpoint" \
  -m "BREAKING CHANGE: remove v1 token endpoint."
```

## Review Before Finishing

commit 前に次を確認する。

- 対象ファイルが 1 つの論点にまとまっている
- type が変更の主目的と一致している
- scope を推測で付けていない
- subject が命令形、小文字開始、句点なしになっている
- body と footer が必要最小限になっている

混在差分なら commit を中止し、分割案だけを返す。
