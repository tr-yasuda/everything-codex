---
name: github-pr-response
description: GitHub Pull Request にレビューコメントが付いたとき、
  コメント一覧の確認、対応要否判断、修正、返信、再レビュー依頼まで
  進める skill。
---

# GitHub PR Response

レビューコメントが付いた PR を対応完了まで進める。
中心に置く成果物は、コメントごとの対応表です。

完了条件は次の通りです。

- 全コメントの対応要否が決定済み。
- 要修正コメントへの修正が push 済み。
- 修正しないコメントの理由が整理済み。
- 必要な返信が投稿済み。
- 一度レビューした人への再レビュー依頼が完了済み。

## 1. 状態を集める

PR、差分、レビュー、コメントを取得する。

```bash
gh auth status
gh pr view <pr> --json number,url,title,headRefName,baseRefName,state,reviewDecision,reviews,latestReviews,reviewRequests,comments,files
gh pr diff <pr>
gh api repos/{owner}/{repo}/pulls/<pr>/comments --paginate
```

PR、repo、コメント、reviewer を特定できなければ止まる。

## 2. 対応表を作る

コメントごとに次を整理する。

- comment ID、reviewer、場所
- 指摘内容の要約
- 判定: 要修正 / 返信のみ / 対応済み・対象外
- 対応方針
- 返信要旨

対応表を提示し、実装前に確認を取る。
曖昧な指摘は推測で処理しない。

## 3. 修正する

要修正コメントだけを最小差分で直す。
修正しないコメントは、返信用の理由を残す。

修正後、関連する test、lint、build を実行する。
確認できない項目があれば理由を残す。

## 4. commit と push

差分を確認する。

```bash
git status --short
git diff
```

修正内容が commit に含まれていることを確認する。
commit が必要なら `$conventional-commits` を使う。
新規 commit、amend、rebase など方法は問わないが、push 前に
修正済み commit ができている状態にする。

```bash
git push
```

## 5. 返信案を作る

投稿前に、コメントごとの返信案を提示して確認を取る。

- 修正した: 変更内容と確認結果。
- 修正しない: 採用しない理由。
- 質問回答: 結論と根拠。

## 6. 返信を投稿する

承認後に返信する。

PR conversation へ返信する場合は、次を使う。

```bash
gh pr comment <pr> --body-file <file>
```

inline review comment へ返信する場合は、次を使う。

```bash
gh api repos/{owner}/{repo}/pulls/comments/<comment_id>/replies -F body=@<file>
```

inline 返信は親 comment ID に送る。
未承認の返信は投稿しない。

## 7. 再レビュー依頼する

`reviews` または `latestReviews` から、一度レビューした人を特定する。
投稿後、同じ reviewer へ再レビューを依頼する。

```bash
gh pr edit <pr> --add-reviewer <login>
```

reviewer が複数なら全員に依頼する。
reviewer が特定できない、または権限がなければ止まる。

## 完了報告

- 対応したコメント
- 修正しなかったコメントと理由
- 投稿した返信
- 再レビュー依頼先
- 残件
