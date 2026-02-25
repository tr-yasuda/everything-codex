---
name: gh-review-responder
description: GitHub PR の未解決レビューコメントをコメント単位で対応要否判定し、必要なら修正後に /review で品質確認してからコミット・PR更新し、各スレッドへ返信して条件付きで resolve まで進める skill。レビュー対応の要否判断から返信と解決までを一連で処理したいときに使う。
---

# gh-review-responder

## 固定ルール

- 対象は現在ブランチに紐づく `open` PR のレビューコメントだけに限定する。
- 判定単位はコメント単位に固定し、判定値は `action_required|no_action|needs_clarification` の 3 値に固定する。
- `no_action` 判定でも返信は必須とし、1〜2 文で根拠を示す。
- `needs_clarification` 判定は確認質問を返信し、`resolve` しない。
- `action_required` 判定でコード変更した場合は、コミット前に必ず `/review` を実行する。
- `/review` の結果に `Medium` 以上の指摘が 1 件でもある場合はコミットを停止し、修正して再度 `/review` を実行する。
- コミットと PR 更新は `\$gh-commit-pr` を使用する。
- 変更差分がない場合はコミットを行わず、返信と必要な `resolve` のみ行う。
- `resolve` は「修正済みかつ返信済み」のスレッドのみ実行する。
- 失敗した時点で処理を止める。
- 明示依頼がない限り、`git reset --hard`、`git push --force`、`rm` を実行しない。

## 参照ファイル

- 判定基準: `references/decision-rules.md`
- 返信テンプレート: `references/reply-templates.md`
- API 呼び出し例: `references/github-graphql-cheatsheet.md`

## 実行手順

1. `git` と `gh` の利用可否を確認する。
2. `gh auth status` が成功することを確認する。
3. 現在ブランチを取得する。
4. `gh pr list --head "<current_branch>" --state open --json number,title,url --limit 1` で対象 PR を 1 件取得する。
5. 対象 PR がない場合は停止する。
6. `gh repo view --json nameWithOwner --jq .nameWithOwner` で `owner/repo` を取得する。
7. `gh api user --jq .login` で実行ユーザーを取得する。
8. `references/github-graphql-cheatsheet.md` のクエリで未解決レビュー thread を取得する。
9. 各 thread から「実行ユーザー以外による最新コメント」を対象コメントとして選ぶ。
10. 対象コメントごとに `references/decision-rules.md` で 3 値判定する。
11. `action_required` のコメントだけ修正する。
12. 修正がある場合は `/review` を実行する。
13. `/review` の `Medium` 以上が 0 件になるまで修正と `/review` を繰り返す。
14. `/review` が通過したら `\$gh-commit-pr` を使ってコミットと PR 更新を行う。
15. 判定結果ごとに `references/reply-templates.md` のテンプレートで返信本文を作る。
16. 各 thread の対象コメントへ返信を投稿する。
17. `action_required` で修正済みかつ返信済みの thread だけ `resolveReviewThread` を実行する。
18. `needs_clarification` と `no_action` は `resolve` しない。
19. 最後に `resolved`、`replied-only`、`pending` の 3 区分で結果を報告する。

## 判定と実行の要点

- 判定で迷う場合は `needs_clarification` を選び、確認質問を優先する。
- 複数コメントが同一 thread にある場合は、最新コメントの要求を優先する。
- 他レビュアー間で要求が競合する場合は `needs_clarification` で論点を明示する。
- `/review` が実行できない環境では停止し、「実行不可の理由」と「ユーザーが行う最小手順」を提示する。

## 返信時の必須要素

- 返信は対象コメントの意図に直接答える。
- `action_required` では「何を修正したか」と「確認手段（テストや根拠）」を短く書く。
- `no_action` では「対応しない理由」を具体的に書く。
- `needs_clarification` では「不足情報」と「確認したい一点」を明示する。
