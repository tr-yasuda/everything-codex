# github-graphql-cheatsheet

## 共通: `gh` 実行ラッパー（1回再試行）

```bash
run_gh() {
  local gh_status=0

  if gh "$@"; then
    return 0
  else
    gh_status=$?
  fi

  if [[ "${GH_RETRY_GH_ONCE:-0}" == "1" || "${GH_RETRY_GH_ONCE:-0}" == "true" ]]; then
    if gh "$@"; then
      return 0
    else
      gh_status=$?
    fi
  fi

  local quoted_args
  printf -v quoted_args '%q ' "$@"
  echo "gh command failed: gh ${quoted_args}" >&2
  echo "retry hint: set GH_RETRY_GH_ONCE=1 and rerun once with approval." >&2
  return "${gh_status}"
}
```

## 前提値の取得

```bash
set -euo pipefail

current_branch="$(git branch --show-current)"
git fetch --prune origin >/dev/null 2>&1 || true

pr_number="$(run_gh pr list --head "${current_branch}" --state open --json number --jq '.[0].number // empty' --limit 1)" || exit 1
repo_full="$(run_gh repo view --json nameWithOwner --jq .nameWithOwner)" || exit 1
owner="${repo_full%/*}"
repo="${repo_full#*/}"
actor_login="$(run_gh api user --jq .login)" || exit 1
```

## 未解決 review threads の取得（GraphQL + `--paginate`）

`--paginate` を使うため、クエリ変数は `$endCursor` を使う。

```bash
run_gh api graphql --paginate \
  -f owner="${owner}" \
  -f repo="${repo}" \
  -F number="${pr_number}" \
  -f query='
query($owner: String!, $repo: String!, $number: Int!, $endCursor: String) {
  repository(owner: $owner, name: $repo) {
    pullRequest(number: $number) {
      reviewThreads(first: 100, after: $endCursor) {
        pageInfo { hasNextPage endCursor }
        nodes {
          id
          isResolved
          isOutdated
          path
          line
          comments(last: 100) {
            nodes {
              id
              databaseId
              body
              url
              createdAt
              author { login }
              replyTo { id }
            }
          }
        }
      }
    }
  }
}
' --jq '.data.repository.pullRequest.reviewThreads.nodes[] | select(.isResolved != true)'
```

## 対象コメントの抽出（自分以外 + top-level）

```bash
threads_json="$(
  run_gh api graphql --paginate --slurp \
    -f owner="${owner}" \
    -f repo="${repo}" \
    -F number="${pr_number}" \
    -f query='
query($owner: String!, $repo: String!, $number: Int!, $endCursor: String) {
  repository(owner: $owner, name: $repo) {
    pullRequest(number: $number) {
      reviewThreads(first: 100, after: $endCursor) {
        pageInfo { hasNextPage endCursor }
        nodes {
          id
          isResolved
          isOutdated
          path
          line
          comments(last: 100) {
            nodes {
              databaseId
              body
              url
              createdAt
              author { login }
              replyTo { id }
            }
          }
        }
      }
    }
  }
}
'
)" || exit 1

echo "${threads_json}" | jq -c --arg actor "${actor_login}" '
  .[]
  | .data.repository.pullRequest.reviewThreads.nodes[]
  | select(.isResolved != true)
  | . as $t
  | (($t.comments.nodes
      | map(select(.author.login != $actor and (.replyTo == null)))
      | sort_by(.createdAt)
      | last) // empty) as $c
  | select($c != null)
  | {
      thread_id: $t.id,
      path: $t.path,
      line: $t.line,
      comment_id: $c.databaseId,
      comment_url: $c.url,
      body: $c.body
    }
'
```

## 最新コメントへの返信（REST）

`comment_id` は top-level review comment（`replyTo == null`）を使う。

```bash
reply_file="$(mktemp)"
cat > "${reply_file}" <<'EOF'
Thanks for the review. I updated <summary_of_fix>.
I validated it with <validation>. I can follow up if you want additional checks.
EOF
```

```bash
run_gh api \
  -X POST \
  -H "Accept: application/vnd.github+json" \
  "repos/${owner}/${repo}/pulls/${pr_number}/comments/${comment_id}/replies" \
  -F body="@${reply_file}"
```

`gh api` では `-F key=@file` 形式でファイル内容を送信できる。本文は `--body` に直接埋め込まない。

## thread の resolve（GraphQL）

`thread_id` は `reviewThreads.nodes[].id` を使う。

```bash
run_gh api graphql \
  -f threadId="${thread_id}" \
  -f query='
mutation($threadId: ID!) {
  resolveReviewThread(input: { threadId: $threadId }) {
    thread {
      id
      isResolved
    }
  }
}
'
```

## 実行後の確認

```bash
run_gh pr view "${pr_number}" --comments
```
