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
- `/review` の重大度は `/review` の仕様に従う。`Medium` 以上（`Medium` と、それより高い重大度）の指摘が 1 件でもある場合はコミットを停止し、修正して再度 `/review` を実行する。
- コミットと PR 更新は `$gh-commit-pr` を使用する。
- 書き込み操作（ファイル編集、コミット、push、PR 返信、thread resolve）の前に必ず `Preflight` を完了する。
- `gh` 疎通確認（`gh api rate_limit` など）が失敗した場合は、承認付きで 1 回だけ再実行する。
- `gh` 疎通確認の再実行が失敗した場合は停止し、失敗時テンプレートで報告する。
- 変更差分がない場合はコミットを行わず、返信と必要な `resolve` のみ行う。
- `resolve` は「修正済みかつ返信済み」のスレッドのみ実行する。
- 失敗した時点で処理を止める。
- 明示依頼がない限り、`git reset --hard`、`git push --force`、`rm` を実行しない。

## 実行モード

- `normal`: 通常実行。判定、必要な修正、返信、条件付き resolve まで行う。
- `preflight-only`: 前提確認だけ行い、判定や書き込み操作を行わない。
- `dry-run`: 判定と返信案、resolve 対象案だけ提示し、コード編集や返信投稿を行わない。

## 参照ファイル

- 判定基準: `references/decision-rules.md`
- 返信テンプレート: `references/reply-templates.md`
- API 呼び出し例: `references/github-graphql-cheatsheet.md`

## 実行手順

1. 実行モードを決定する。指定がなければ `normal` にする。
2. `git` と `gh` の利用可否を確認する。
3. `gh auth status` が成功することを確認する。
4. `gh api rate_limit --jq '.rate.remaining'` を実行して API 疎通を確認する。
5. 手順 3 または 4 が失敗した場合は、承認付きで同じコマンドを 1 回だけ再実行する。
6. 再実行でも失敗した場合は、失敗時テンプレートで報告して停止する。
7. 現在ブランチを取得する。
8. `gh pr list --head "<current_branch>" --state open --json number,title,url --limit 1` で対象 PR を 1 件取得する。
9. 対象 PR がない場合は停止する。
10. `preflight-only` の場合は、確認結果を出力して停止する。
11. `gh repo view --json nameWithOwner --jq .nameWithOwner` で `owner/repo` を取得する。
12. `gh api user --jq .login` で実行ユーザーを取得する。
13. `references/github-graphql-cheatsheet.md` のクエリで未解決レビュー thread を取得する。
14. 各 thread から「実行ユーザー以外による最新コメント」を 1 件ずつ対象コメントとして選び、対象コメント一覧を作る。
15. 対象コメント一覧の各コメントごとに `references/decision-rules.md` で 3 値判定する。
16. `dry-run` の場合は、判定結果、返信案、resolve 対象案を出力して停止する。
17. `action_required` のコメントだけ修正する。修正後に `git status --short` か `git diff --cached` で差分有無を確認する。
18. 修正差分を確認できる場合だけ `/review` を実行する。`/review` が実行できない場合は停止し、「実行不可の理由」と「ユーザーが行う最小手順」を提示する。
19. `/review` の `Medium` 以上が 0 件になるまで修正と `/review` を繰り返す。
20. `/review` が通過したら `$gh-commit-pr` を使ってコミットと PR 更新を行う。
21. 判定結果ごとに `references/reply-templates.md` のテンプレートで返信本文を作る。
22. 各 thread の対象コメント（手順 14 で選んだ同一コメント）へ返信を投稿する。
23. `action_required` で修正済みかつ返信済みの thread だけ `resolveReviewThread` を実行する。
24. `needs_clarification` と `no_action` は `resolve` しない。
25. 最後に結果を集計して報告する。内訳は `resolved`（`action_required` 判定で修正・返信まで完了し、thread を resolve したもの）、`replied-only`（`no_action` 判定や、`action_required` 判定だったが追加修正不要と判断して返信のみ行ったもの）、`pending`（`needs_clarification` 判定で追加回答待ちのもの）の 3 区分とする。

## 判定と実行の要点

- 判定で迷う場合は `needs_clarification` を選び、確認質問を優先する。
- 複数コメントが同一 thread にある場合は、最新コメントの要求を優先する。
- 他レビュアー間で要求が競合する場合は `needs_clarification` で論点を明示する。
- `/review` が実行できない環境では停止し、「実行不可の理由」と「ユーザーが行う最小手順」を提示する。
- `dry-run` ではコード編集と API 投稿を行わず、対応計画だけ提示する。
- `action_required` 判定でも、調査の結果「追加修正が不要」と判断した場合は `no_action` に再分類し、根拠付きで返信して `resolve` しない。

## 返信時の必須要素

- 返信は対象コメントの意図に直接答える。
- `action_required` では「何を修正したか」と「確認手段（テストや根拠）」を短く書く。
- `no_action` では「対応しない理由」を具体的に書く。
- `needs_clarification` では「不足情報」と「確認したい一点」を明示する。

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
