---
name: github-pr-response
description: GitHub の Pull Request で、自分が受けたレビューコメントへの
  対応を進める skill。GitHub app で PR metadata、差分、flat comments を
  確認し、`github:github` で PR の文脈を解決し、`github:gh-address-comments`
  で未解決 review thread と修正対象を整理したうえで、返信・resolve・
  再レビュー依頼まで進めたいときに使う。review thread の resolve 状態や
  thread ID が必要な場面だけ `gh api graphql` を使う。
---

# GitHub PR Response

## Route Through GitHub Plugin First

最初に GitHub プラグインを前提に進める。

- PR 番号、URL、リポジトリ名が分かっているならそれを使う
- PR の概要、patch、flat comments は GitHub app で取得する
- 「この branch の PR」など文脈解決が必要なら `github:github` を使う
- 未解決 review thread の整理や修正実装は `github:gh-address-comments` に寄せる
- `.codex/plugins/cache/...` の固定パスや、plugin 内部構成を前提にしない

GitHub プラグインが使えない場合は、その旨を伝えて止まる。
純粋な `gh` だけの代替フローを勝手に組み立てない。

## Inspect The PR State First

返信や修正の前に、PR 全体の状態を把握する。

- GitHub app で PR metadata、差分、top-level comments を確認する
- 未解決 thread、inline の文脈、resolve 状態が重要なら
  `github:gh-address-comments` の流れで確認する
- 未対応のコメントと、すでに対応済みまたは outdated なものを分ける
- 自分が返答すべきコメントと、コード修正が必要なコメントを仕分ける

flat comments だけを review thread の完全な真実として扱わない。
thread-aware な判断が必要なら、必ず `github:gh-address-comments` 側へ寄せる。

## Treat Ambiguity As A Stop Signal

次のケースは曖昧扱いにする。

- PR 番号、URL、リポジトリのいずれも特定できない
- コメントの意図が不明で、修正対応と返信対応を切り分けられない
- 修正が必要かどうか読み取れない
- GitHub app では足りず `gh` も必要だが、`gh auth` が通らない
- reviewer や resolve 対象 thread を特定できない

曖昧な場合は、不足している情報と確認事項を返して止まる。
推測で修正、返信、resolve、再レビュー依頼に進まない。

## Categorize The Remaining Work

コメントを次の 3 種類に分類する。

- 要修正。コードや内容の変更が必要なもの
- 要返信のみ。質問、確認、提案で、返信だけで完結するもの
- 対応済み / スキップ。すでに修正済み、resolve 済み、outdated、
  または自分には関係ないもの

分類結果をユーザーに提示し、対応方針を確認する。
ユーザーが「全部対応」と明示した場合だけ、未解決で actionable なものを
一括対象として扱う。

## Implement Code Changes Through Specialist Skill

要修正のコメントは `github:gh-address-comments` に寄せて対応する。

- 未解決 thread の整理、ファイル単位のクラスタリング、修正実装は
  `github:gh-address-comments` の流れを優先する
- どの変更がどの thread に対応するかを追跡できる状態で進める
- 修正後は関連するテストや lint を確認する
- commit は明示依頼がある場合だけ行う

この skill 自体で thread 取得ロジックや review comment 収集手順を
再実装しない。

## Reply Through The GitHub App

返信は GitHub app を優先して行う。

- inline review comment への返信は review comment reply 系を使う
- PR conversation への返信は issue comment 系を使う
- 複数の指摘へ 1 回でまとめて返す場合は review submission 系を使う
- 返信文は先にユーザーへ提示し、確認後に投稿する

返信文には次を含める。

- 対応した場合: 何をどう修正したか
- 対応しない場合: 採用しない理由
- 質問への回答: 根拠と結論

GitHub app で足りる場面では、`gh api` で reply endpoint を直叩きしない。

## Resolve Threads With gh Only When Needed

thread の resolve は、GitHub app で不足する部分だけ `gh` を使う。

- thread ID や `isResolved` の確認が必要なら、thread-aware な取得結果を使う
- resolve は `gh api graphql` の `resolveReviewThread` mutation で行う
- 未対応のコメントが残っている状態で resolve しない
- ユーザーの確認なしに一括 resolve しない

`gh` を使う前に、認証状態が必要なら `gh auth status` を確認する。

## Request Re-Review Explicitly

再レビュー依頼は、ユーザーが明示した場合だけ行う。

- reviewer が分かっているなら `gh pr edit <number> --add-reviewer <reviewer>` を使う
- reviewer が不明なら確認してから進める
- 対象 thread が対応済み、または意図的に open のまま残す理由が整理されてから進める

レビュー依頼を急がず、未解決事項が残る場合はその理由を先に共有する。

## Review Before Finishing

終了前に次を確認する。

- すべての要修正コメントに対応している
- すべての要返信コメントに返信しているか、未返信理由を共有している
- resolve 済みの thread に未対応事項が残っていない
- 明示依頼なしに commit、返信、resolve、再レビュー依頼をしていない
- GitHub app と `gh` の役割を取り違えていない

終了時は、対応したコメント数、返信数、resolve 数、再レビュー依頼の有無、
未対応事項の有無をまとめて返す。
