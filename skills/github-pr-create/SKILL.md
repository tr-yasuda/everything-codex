---
name: github-pr-create
description: 現在のブランチやローカル checkout から GitHub Pull Request を
  準備・作成する skill。Codex の GitHub app を優先して PR を開きたいとき、
  push 済みブランチから PR だけを作りたいとき、または GitHub publish flow に
  このリポジトリ固有の PR テンプレートと branch/commit 規約を適用したいときに使う。
---

# GitHub PR Create

## Overview

この skill は GitHub plugin の publish workflow を補う、
repo 固有の薄い拡張として使う。

- ローカルの `git` で現在のブランチと作業ツリーを確認する
- PR 作成は Codex の GitHub app を第一選択にする
- `gh` は fallback としてだけ使う
- branch 名と commit 状態の整備は既存 skill に委ねる

commit、push、PR 作成までを一気に進める依頼では、
GitHub plugin の `yeet` skill を主経路として使う。
この skill では PR 本文と安全条件を補う。

## Inspect The Current State First

最初に次を確認する。

- `git status --short` で未コミット変更や混在差分の有無を確認する
- `git branch --show-current` で現在の branch を把握する
- 必要なら `git diff --stat` と `git log --oneline` で差分の論点を確認する
- 必要なら `git remote get-url origin` で対象リポジトリを確認する

PR の対象が曖昧なまま本文作成や PR 作成に進まない。

## Route To Supporting Skills Early

次のケースでは、この skill だけで抱え込まずに委譲する。

- 未コミット変更や論点混在がある: `conventional-commits` skill を使う
- branch 名が規約に沿っているか曖昧: `conventional-branching` skill を使う
- commit、push、PR 作成まで含む公開フロー: GitHub plugin の `yeet` skill を使う

この skill は publish workflow 全体を再実装しない。
repo 固有の PR ルールを追加する役割に留める。

## Treat Ambiguity As A Stop Signal

次のケースは曖昧扱いにする。

- 未コミット変更が残っている
- branch 名が規約に沿っていない、または妥当性が判断できない
- base branch が決められない
- PR のタイトルや概要を決める情報が足りない
- branch がまだ remote に存在せず、publish workflow へ切り替える必要がある
- GitHub app でも `gh` fallback でも repo や head を安全に特定できない

曖昧な場合は、不足情報と確認事項を返して止まる。
推測で PR を作成しない。

## Determine Repository And Branch Context

PR の対象は次の順で決める。

1. ユーザーが repo、base、head を明示した場合はそれを使う
2. 現在の local checkout から `origin` と現在 branch を解決する
3. base branch は remote の default branch を使う
4. 上記で安全に確定できない場合は候補を示して確認を取る

push 済み branch から PR を作る依頼なら、この skill で進めてよい。
まだ push されていない場合は、勝手に push せず `yeet` に委ねる。

## Prefer The GitHub App For PR Creation

PR 作成は Codex の GitHub app を第一選択にする。

- `repository_full_name`、`head_branch`、`base_branch` を明示できるなら app を使う
- app で repo や branch を安全に表現できない場合だけ `gh pr create` を fallback に使う
- `gh` が無いこと自体は即停止条件にしない

fork や cross-repo などで head の表現が難しい場合は、
`gh` fallback を優先してよい。

## Write The PR Body From The Repository Template

PR 本文は `.github/PULL_REQUEST_TEMPLATE.md` に沿って埋める。
次のセクションを必須にする。

- `概要`
- `変更内容`
- `影響範囲`
- `確認事項`
- `備考`

`確認事項` には次のチェックリストを維持する。

- `pnpm lint:md`
- `pnpm lint:spell`
- `pnpm lint:text`
- 変更内容に関連するドキュメントやコメントの更新

本文は差分から読み取れる事実だけで組み立てる。
情報が不足している場合は、推測で埋めず確認を取る。

## Default To Draft Pull Requests

PR の既定値は draft にする。

- ユーザーが ready for review を明示した場合だけ通常 PR を作る
- 指定がない場合は draft を使う
- draft から通常 PR へ切り替える操作も明示依頼がある場合だけ行う

## Review Before Finishing

終了前に次を確認する。

- PR 対象の branch、repo、base が一致している
- branch 名と commit 状態の問題を見逃していない
- PR 本文がテンプレートの全セクションを含んでいる
- draft / 通常 PR のモードが依頼内容と一致している
- 明示依頼なしに push、通常 PR 化、force push をしていない

作成後は PR の URL とともに、base、head、draft かどうか、
GitHub app と fallback のどちらを使ったかを返す。
