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
2. commit に含める変更を stage する
3. 「検証」に従い、stage した内容に対して必要なテスト・型チェック・lint・build の結果を揃える
4. Conventional Commits 形式の commit message と PR title を作り、「公開前の点検」で確かめる。
   commit message は stage した変更を、PR title は今回の commit を反映した PR 全体の差分を説明する
5. 「Branch」に従って branch 名を決める
6. 「commit と push の照合」に従い、stage の内容を照合してから commit し、push の前に commit の内容を照合する
7. 照合した commit を origin の同じ名前の branch へ push し、upstream をその branch にする
8. PR body を作り、「公開前の点検」で確かめる。PR body は今回の commit を反映した PR 全体の差分を説明する
9. open の PR がなければ Draft PR を作成し、あれば更新する

## 検証

PR body と PR template のチェック欄に書く検証結果は、記録した内容に対して、「検証する場所」で実行した結果だけを根拠にする。
記録する前に実行した結果は、この会話の中で得たものでも根拠にしない。

repository で要求されるテスト・型チェック・lint・build のうち、根拠のない項目は自分で実行する。

検証を始める前に、stage した内容を `git write-tree` で記録する。
この値を、「commit と push の照合」で検証時の内容として使う。

### 検証する場所

作業ツリーに、stage していない変更や未追跡のファイルがない場合は、作業ツリーで検証する。
`.gitignore` で無視されるファイルは、ここでは数えず、別の作業場所へ作業ツリーから持ち込んでよい。

ある場合は、記録した内容だけを再現した別の作業場所を作り、そこで検証する。
同じファイルの一部だけを stage した場合も、これに含める。
作業ツリーで検証すると、commit に含まれない変更のおかげで通った結果を、commit する内容の結果と区別できないため。
別の作業場所は、途中で止まる場合も含め、使い終わったら片付ける。片付けられなければ、その場所を報告する。
作業ツリーの変更には触らない。

別の作業場所で検証できない場合は、「実行できない場合」に従う。
このとき、作業ツリーで得た結果を、commit する内容の検証結果の代わりにしない。

この skill では、検証の失敗を直さない。
検証が失敗したら、commit・push・PR の作成をせず、既存の PR も更新せずに止まる。
Draft PR であっても、検証に失敗した状態のまま公開しない。
報告には、失敗した検証、未解決の問題、次に依頼すればよいことを短く書く。

### 実行できない場合

次の場合だけを、検証できなかったものとして扱う。それ以外の失敗は、検証の失敗として扱う。

- 検証を始められなかった
- 失敗の原因が、権限、credentials、外部サービスなどの実行環境にあると確かめられた

依存関係の未インストールやローカルのサービスの未起動など、ローカルで解決できる不足は自分で解決する。
権限、credentials、外部サービスの不足は回避せず、最も近い代替手段でできる限り確かめる。
本番環境や実在の外部サービスに接続する検証は、実行する前にユーザーへ確認する。

それでも確かめられない部分が残る場合は、その範囲と理由を PR body に書く。
該当するチェック欄は空のままにして、Draft PR を作成または更新する。

## commit と push の照合

検証のあとで、検証した場所、stage、commit の内容は変わり得る。
別のエージェント、Git hooks、自分が起動したツールなど、原因は限らない。

検証が終わったら、検証した場所で次の 2 つを実行し、どちらも出力が空であることを確かめる。

- `git diff <記録した値>`
- `git ls-files --others --exclude-standard`

commit の直前に `git write-tree` を実行し、記録した値と比べる。
commit したあと、push の前に `git rev-parse HEAD^{tree}` を実行し、同じ値と比べる。

空でないか一致しなければ、その時点で止まり、それ以降の commit・push・PR の作成と、既存の PR の更新をしない。
変わった内容の出どころを推測して取り込んだり、検証をやり直したりしない。
作った commit は取り消さない。
報告には、どの照合で食い違ったかと、変わったファイルと変更の種類を書く。
commit を作っていれば、その SHA と、push していないことも書く。
最後に、次に依頼すればよいことを書く。

## 公開前の点検

commit message、PR title、PR body は、push や PR の作成で公開される。
誤りや不要な文が残ると、確かめて整理する負担がレビュアーへ移る。
公開する前に自分で読み直して直し、文面の承認をユーザーに求めない。

PR title と PR body では、次を確かめる。

- 事実関係: 変更の説明を、今回の commit を反映した PR 全体の差分と照合する。
  作業ツリーに残る無関係な変更は、PR の変更として説明しない。
  検証結果とチェック欄を「検証」の根拠と照合する。変更や根拠と合わない文は直すか削る
- 必要性と読みやすさ: レビュアーが変更の目的、内容、影響、検証結果を理解し、レビューの判断に使う文だけを残す。
  経緯、作業ログ、差分を読めば分かる細部の列挙、前置き、繰り返しは削る
- 秘密情報: credentials、secrets などの秘密情報と個人情報を含めない

commit message では、実際の commit の内容と一致し、不要な説明と秘密情報がないことを確かめる。

### 既存の PR を更新する場合

既存の PR body は、現在の差分と照合して更新する。
チェック欄と検証結果の記述は、誰が書いたかにかかわらず、「検証」の根拠に合わせて更新する。

人が書き足した説明と、誰が書いたか分からない説明は、推測で削除したり書き換えたりしない。
それらが現在の差分と矛盾する場合は、変更せずに残し、該当箇所と矛盾の内容をユーザーに報告する。
ほかの部分の更新は続ける。
矛盾する説明が残っている間は、PR body が差分と一致しているとは報告しない。

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

- ユーザーが指定した場合は、指定された文字列と一字一句同じときだけ同じとみなす
- 指定がない場合は、`type` が PR title と同じで、`subject` が変更内容に合っていれば、同じとみなす

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

## Rules

- PR は Draft で作成する
- unrelated changes を commit に含めない。stage 済みのものも含めて変更・破棄せず、stage 済みのため commit から外せなければ止めて報告する
- PR に含めなかった unrelated changes があれば、PR body には書かず、ユーザーへの報告で伝える
- open の PR がある場合は新しい PR を作らない
- PR title と body は実際の差分を確認してから作る
- 根拠のない検証結果を書かず、実行していない検証のチェック欄に印を付けない
- local absolute path と秘密情報を、commit message、PR title、PR body に書かない
- PR template の必須項目を削除しない
- push や PR 作成に失敗した場合は原因を確認し、解決可能なものは修正して続行する
- push が拒否されても force push はしない。
  origin の同じ名前の branch を取り込まず、止めて報告する
