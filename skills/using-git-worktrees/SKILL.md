---
name: using-git-worktrees
description: 新しいタスクを始める前に、現在の checkout を汚さない
  作業場所を `.worktrees/` 配下に用意する skill。worktree の新規作成、
  既存 worktree の再利用、初回セットアップ、片付け方針を決めるときに使う。
---

# Using Git Worktrees

## 目的

新しいタスクは、原則として `.worktrees/<branch-name>/` で始める。
現在の checkout は作業の起点として残し、実装による変更を混ぜない。

この skill は「どこで作業するか」を安全に決めるためのものです。
branch 名の規約は `conventional-branching` を参考にするが、
その skill を直接実行して現在の checkout を切り替えない。

## User Stories

### 新しいタスクを始める

ユーザーは、今の checkout を汚さずに新しい実装を始めたい。

Good:

- `.worktrees/<branch-name>/` に作業場所を作る
- 現在の checkout の branch は切り替えない
- branch 名はタスク内容から conventional な形式にする
- 作成後、どの path と branch で作業するかを報告する

Bad:

- 現在の checkout で `git switch -c` する
- タスク名が曖昧なまま branch 名を確定する
- `.worktrees/` が track 対象のまま作業場所を作る

### 既存 worktree で作業を再開する

ユーザーは、前に作った worktree の作業を続けたい。

Good:

- `git worktree list` で既存 worktree を確認する
- 同じ branch の worktree があれば、新規作成せず再利用する
- dirty な worktree は、その状態を報告してから続ける

Bad:

- 同じ目的の worktree を別名で増やす
- 既存の未完了作業を見ずに新しい branch を作る

### 初回セットアップする

ユーザーは、まだ `.worktrees/` がない repo で worktree 運用を始めたい。

Good:

- project root に `.worktrees/` を作る
- `.worktrees/` を Git の追跡対象にしない

Bad:

- repo ごとに違う置き場を推測で作る
- `.worktrees/` の中身が git status に出る状態で進める

### 作業後に片付ける

ユーザーは、merge 済みまたは不要になった worktree を片付けたい。

Good:

- clean な worktree だけ削除候補にする
- 未 push branch や dirty worktree は削除しない
- 削除前に対象 path と branch を明示する

Bad:

- dirty worktree を削除する
- branch の状態を見ずに directory だけ消す

## Workflow

### 1. Git repo と worktree 状態を見る

最初に Git 管理下であることと、既存 worktree を確認する。

```bash
git rev-parse --show-toplevel
git worktree list
git status --short
```

すでに `.worktrees/` 配下、または `git worktree list` に出る別 checkout
で作業しているなら、さらに worktree を作らない。

### 2. 作業 branch 名を決める

branch 名は `conventional-branching` の命名規則を参考にする。
ただし `conventional-branching` を直接実行しない。

```text
feature/add-user-settings
bugfix/fix-login-redirect
docs/update-worktree-skill
```

タスク内容だけでは type や slug を安全に決められない場合は、
branch 名候補を出して確認する。

### 3. `.worktrees/` を用意する

project root に `.worktrees/` があれば使う。
なければ `.worktrees/` を作る。

`.worktrees/` は作業用の置き場であり、commit 対象ではない。
`git status --short` に `.worktrees/` が出る場合は、
worktree 作成や実装に進まず、ユーザーに状況を伝えて止まる。

### 4. worktree を作るか再利用する

同じ branch の worktree がすでにある場合は、それを再利用する。
なければ `.worktrees/<branch-name>/` に作る。

```bash
git worktree add ".worktrees/<branch-name>" -b "<branch-name>"
```

既存 branch から作業場所だけ作る場合は、`-b` を付けない。

```bash
git worktree add ".worktrees/<branch-name>" "<branch-name>"
```

### 5. 作業場所を報告する

作成または再利用したら、短く報告してから実装に進む。

```text
Worktree ready:
- path: .worktrees/docs/update-worktree-skill
- branch: docs/update-worktree-skill
```

## 他 skill との関係

- `conventional-branching`:
  branch 名の規約だけ参考にする。直接実行しない。
- `conventional-commits`:
  worktree 準備とは別に、repo へ残す変更を commit するときに使う。
- 言語別 practice skill / `tdd`:
  worktree 作成後、対象言語やテスト方針が決まってから使う。
- `github-pr-create`:
  worktree 上の branch から PR を作るときに使う。

## Review Before Continuing

実装を始める前に、次を確認する。

- 作業場所が `.worktrees/<branch-name>/` になっている
- 現在の checkout を切り替えていない
- `.worktrees/` を commit 対象にしていない
- 既存 worktree がある場合は重複作成していない
- branch 名がタスク内容と合っている
- repo 固有の setup や検証は、その repo の指示に従う
