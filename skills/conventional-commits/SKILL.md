---
name: conventional-commits
description: 現在の変更内容を確認し、Conventional Commits 形式で 1 件の
  `git commit` を作成する skill。`git status` や `git diff` で差分を見て、
  必要な確認を挟み、1 つの論点だけを stage して commit したいときに使う。
---

# Conventional Commits

## Workflow

### 1. Inspect

最初に現在の変更を確認する。

```bash
git status --short
git diff --stat
git diff
```

staged changes がある場合は、次も必ず確認する。

```bash
git diff --cached
```

### 2. Decide

差分から 1 件の commit にまとめる主題を 1 つ選ぶ。

- `feat`: 新機能の追加
- `fix`: バグ修正
- `docs`: ドキュメントのみの変更
- `style`: 振る舞いに影響しない整形
- `refactor`: 機能追加やバグ修正を伴わない構造変更
- `perf`: 性能改善
- `test`: テストの追加や修正
- `chore`: 補助ツールや依存関係の更新
- `ci`: CI 設定や自動化の変更
- `revert`: 既存 commit の取り消し

scope は任意にする。
明確なサブシステム名がある場合だけ付ける。
推測が必要なら省略する。

### 3. Ask

次のどれかに当てはまる場合は、stage や commit の前で止まる。

- 変更が複数の論点に分かれている
- type が 1 つに決まらない
- scope を付けるか迷う
- 同じファイルに staged changes と unstaged changes が混在している
- commit message の言語を設定や会話履歴から決められない

staged changes と unstaged changes が別ファイルに分かれている場合は、
`git diff --cached` と `git diff` を見て判断する。
明らかに同じ論点なら続行してよい。
同じ論点か迷う場合だけ、対象ファイル一覧と commit 候補を示して止まる。

commit message の言語は、次の順で決める。

1. ユーザーの明示指定
2. `AGENTS.md` や repo 内の運用ドキュメントにある言語設定
3. 現在の会話やタスク内で一度確認済みの言語

上のどれでも決められない場合だけ、初回に確認する。
一度選ばれた言語は、同じ会話やタスク内では再確認しない。
会話言語だけでは初回の言語を確定しない。

選択肢付き確認ツールが使える場合は、それを使う。
使えない場合は、短く直接聞く。

```text
commit message の言語はどれにしますか？
- 日本語
- English
- その他
```

言語以外の曖昧さがある場合は、対象ファイル一覧と commit 候補を示し、
確定してから続ける。

### 4. Write

commit message は次の形式にする。

```text
<type>: <subject>
<type>(<scope>): <subject>

[<body>]

[<footer>]
```

subject は次の規則で書く。

- ユーザーが指定または選択した言語で書く
- English を選んだ場合は命令形を使い、小文字で始める
- 文末に `.` を付けない
- 50 文字前後を目安にし、長くても 72 文字以内に収める
- 変更結果ではなく、行う操作を表す

body は理由や背景が必要なときだけ追加する。
footer は `Fixes #123` や `BREAKING CHANGE:` に使う。

### 5. Stage And Commit

次のような依頼は、commit 実行依頼として扱う。

- `commitして`
- `この変更をコミットして`
- `$conventional-commits`

ただし、次を満たすまで `git add` や `git commit` を実行しない。

- 差分が 1 つの論点にまとまっている
- commit message の言語が確定している
- type と scope の扱いが確定している
- staged changes と unstaged changes の扱いが確定している

commit する場合は、対象に選んだファイルだけを stage する。
`git add -A` で無関係な変更までまとめない。

ファイル全体が 1 つの論点なら `git add -- <file>` を使う。
削除を含む場合は `git add -A -- <path>` で対象 path だけを stage する。
同じファイル内に複数論点が混ざる場合は `git add -p` を優先する。
patch の選択に迷う場合は stage せず、分割案を返す。

commit message は、type、scope、subject が明らかな場合は提示せずに
そのまま使ってよい。
曖昧さがある場合、またはユーザーが確認を求めている場合だけ、
候補を提示して確認する。

`git commit` は対話エディタを開かず、`-m` を使って実行する。
body や footer が必要なら追加の `-m` を使う。

```bash
git commit -m "docs: update contributor guide"
git commit -m "feat(api)!: remove legacy token endpoint" \
  -m "BREAKING CHANGE: remove v1 token endpoint."
```

### 6. Report

終了時は、commit したか、確認待ちで止めたかを短く報告する。

commit した場合は commit hash と commit message を示す。
止めた場合は、必要な確認事項だけを示す。

## Review Before Finishing

commit 前に次を確認する。

- 対象ファイルが 1 つの論点にまとまっている
- type が変更の主目的と一致している
- scope を推測で付けていない
- commit message の言語を設定または確認履歴から決めている
- English subject が命令形、小文字開始、句点なしになっている
- body と footer が必要最小限になっている

混在差分や未確定事項があれば commit を中止し、確認事項だけを返す。
