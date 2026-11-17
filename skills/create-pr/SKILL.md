---
name: create-pr
description: 現在の変更を Conventional Commits 形式で commit・push し、GitHub Pull Request を作成または更新する skill。
disable-model-invocation: true
---

# Create PR

この skill は明示的に呼び出された場合のみ使用する。

```text
$create-pr
```

この skill の呼び出し自体を、commit・push・PR 作成の許可として扱う。

## Workflow

1. 現在の Git repository と変更内容を確認する
2. 必要なテスト・型チェック・lint・build が完了しているか確認する
3. 変更内容に合った Conventional Commits 形式の commit message を作る
4. 「Branch」に従って branch 名を決める
5. 変更を stage して commit する
6. current branch を origin の同じ名前の branch へ push し、upstream をその branch にする
7. open の PR がなければ Draft PR を作成し、あれば更新する

## Branch

branch 名は、PR をレビューする人の目に入る。
変更内容を表す名前で PR にする。

current branch に open の PR がある場合は、branch 名を変えない。
merge 済みや close 済みの PR は、ここでは数えない。

open の PR がない場合は、push の前に branch 名を決める。
ユーザーが branch 名を指定していれば、その名前にする。
指定がなければ、次の形にする。

```text
<type>/<subject>
```

- `type` は PR title と同じものを使う
- `subject` は、実際の差分が表す変更内容を、英小文字の kebab-case で書く
- 同じ名前の branch が手元か origin にすでにある場合は、区別できる `subject` にする。
  origin は fetch してから確かめる

例は次のとおり。

```text
feat/retry-handling
fix/cross-tenant-access
```

current branch の名前が、決めた名前と同じならそのままにする。
`type` が PR title と同じで、`subject` が変更内容に合っていれば、同じとみなす。

違う場合は、次のように扱う。

- default branch にいるか、どの branch にもいない場合は、決めた名前で新しい branch を作る
- それ以外の場合は、current branch を決めた名前に付け直す

名前を変えるかどうかを、ユーザーに確認しない。
名前を変えた場合は、成功・失敗を問わず、報告で元の名前と新しい名前を伝える。

元の名前の branch が origin に push 済みの場合、origin 側の branch は削除しない。
残っていることを報告で伝える。

## Commit / PR Title

commit message と PR title は Conventional Commits 形式にする。

```text
<type>(<scope>): <subject>
```

`scope` は省略してよい。

例は次のとおり。

```text
feat: add retry handling
fix(auth): prevent cross-tenant access
refactor: simplify session state handling
test: add regression coverage
```

type は変更内容に最も合うものを選ぶ。

- `feat`
- `fix`
- `refactor`
- `test`
- `docs`
- `style`
- `chore`
- `perf`
- `build`
- `ci`

PR title は、PR 全体の変更内容を表す Conventional Commits 形式にする。

## PR Body

repository に PR template がある場合は、それを使用する。

template がない場合は以下の形式にする。

```markdown
## Why

この変更が必要な理由を書く。

## What Changed

実際に変更した内容を簡潔に書く。
```

会話中に変更理由が説明されている場合は、その内容を PR body に反映する。

過程ではなく、最終的な差分だけを書く。

## Rules

- PR は Draft で作成する
- unrelated changes を commit に含めない
- open の PR がある場合は新しい PR を作らない
- PR title と body は実際の差分を確認してから作る
- local absolute path を PR body に書かない
- PR template の必須項目を削除しない
- push や PR 作成に失敗した場合は原因を確認し、解決可能なものは修正して続行する
- push が拒否されても force push はしない。
  この実行で名前を決めた branch では、origin の同じ名前の branch を取り込まず、止めて報告する
