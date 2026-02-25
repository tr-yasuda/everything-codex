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
query($owner: String!, $repo: String!, $number: Int!) {
  repository(owner: $owner, name: $repo) {
    pullRequest(number: $number) {
      reviewThreads(first: 100) {
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

`hasNextPage` が `true` の場合は、`endCursor` を使って `after:` 付きで再取得し、全 thread を回収する。

## 最新コメントへの返信（REST）

`comment_id` は `comments.nodes[].databaseId` を使用する。

```bash
gh api \
  -X POST \
  "repos/${owner}/${repo}/pulls/${pr_number}/comments/${comment_id}/replies" \
  -F body="@${reply_file}"
```

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
