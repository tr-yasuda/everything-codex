# github-graphql-cheatsheet

## 前提値の取得

```bash
current_branch="$(git branch --show-current)"
pr_number="$(gh pr list --head "${current_branch}" --state open --json number --jq '.[0].number // empty' --limit 1)"
repo_full="$(gh repo view --json nameWithOwner --jq .nameWithOwner)"
owner="${repo_full%/*}"
repo="${repo_full#*/}"
actor_login="$(gh api user --jq .login)"
```

## 未解決 review threads の取得

```bash
gh api graphql \
  -f owner="${owner}" \
  -f repo="${repo}" \
  -F number="${pr_number}" \
  -f query='
query($owner: String!, $repo: String!, $number: Int!, $after: String) {
  repository(owner: $owner, name: $repo) {
    pullRequest(number: $number) {
      reviewThreads(first: 100, after: $after) {
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          id
          isResolved
          isOutdated
          path
          line
          comments(last: 30) {
            nodes {
              id
              databaseId
              body
              url
              createdAt
              author { login }
            }
          }
        }
      }
    }
  }
}
' --jq '.data.repository.pullRequest.reviewThreads.nodes[] | select(.isResolved != true)'
```

`hasNextPage` が `true` の場合は、`endCursor` を `after` に渡して再取得し、全 thread を回収する。

```bash
after_cursor=""
while :; do
  if [[ -z "${after_cursor}" ]]; then
    response=$(
      gh api graphql \
        -f owner="${owner}" \
        -f repo="${repo}" \
        -F number="${pr_number}" \
        -f query='
query($owner: String!, $repo: String!, $number: Int!, $after: String) {
  repository(owner: $owner, name: $repo) {
    pullRequest(number: $number) {
      reviewThreads(first: 100, after: $after) {
        pageInfo { hasNextPage endCursor }
        nodes {
          id
          isResolved
          isOutdated
          path
          line
          comments(last: 30) {
            nodes {
              id
              databaseId
              body
              url
              createdAt
              author { login }
            }
          }
        }
      }
    }
  }
}
'
    )
  else
    response=$(
      gh api graphql \
        -f owner="${owner}" \
        -f repo="${repo}" \
        -F number="${pr_number}" \
        -F after="${after_cursor}" \
        -f query='
query($owner: String!, $repo: String!, $number: Int!, $after: String) {
  repository(owner: $owner, name: $repo) {
    pullRequest(number: $number) {
      reviewThreads(first: 100, after: $after) {
        pageInfo { hasNextPage endCursor }
        nodes {
          id
          isResolved
          isOutdated
          path
          line
          comments(last: 30) {
            nodes {
              id
              databaseId
              body
              url
              createdAt
              author { login }
            }
          }
        }
      }
    }
  }
}
'
    )
  fi

  echo "${response}" | jq '.data.repository.pullRequest.reviewThreads.nodes[] | select(.isResolved != true)'

  has_next="$(echo "${response}" | jq -r '.data.repository.pullRequest.reviewThreads.pageInfo.hasNextPage')"
  if [[ "${has_next}" != "true" ]]; then
    break
  fi

  end_cursor="$(echo "${response}" | jq -r '.data.repository.pullRequest.reviewThreads.pageInfo.endCursor')"
  after_cursor="${end_cursor}"
done
```

## 最新コメントへの返信（REST）

`comment_id` は `comments.nodes[].databaseId` を使用する。
`reply_file` は投稿前に作成して本文を保存する。

```bash
reply_file="$(mktemp)"
cat > "${reply_file}" <<'EOF'
ご指摘ありがとうございます。`<summary_of_fix>` を反映しました。
`<validation>` で確認済みです。必要なら追加観点も対応します。
EOF
```

```bash
gh api \
  -X POST \
  "repos/${owner}/${repo}/pulls/${pr_number}/comments/${comment_id}/replies" \
  -F body="@${reply_file}"
```

`gh api` では `-F key=@file` 形式でファイル内容を送信できる。ここでは `-F` を使う。

## thread の resolve（GraphQL）

`thread_id` は `reviewThreads.nodes[].id` を使用する。

```bash
gh api graphql \
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
gh pr view "${pr_number}" --comments
```
