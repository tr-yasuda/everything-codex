---
name: conventional-branching
description: 現在の作業内容や Issue 番号から、規約に沿ったブランチ名を
  提案し、必要なら Git ブランチを作成する skill。作業開始前に branch
  type と description を決めたいとき、命名規則を確認したいとき、
  明示依頼のうえで重複確認後にブランチ作成まで進めたいときに使う。
---

# Conventional Branching

## Inspect The Request First

最初に次を確認する。

- 作業内容の要約
- Issue 番号の有無
- ブランチ名の提案だけか、作成まで求められているか
- 既存ブランチとの衝突確認が必要か

依頼に十分な情報がない場合は、推測で確定しない。
不足している点と候補を示して止まる。

## Treat Ambiguity As A Stop Signal

次のケースは曖昧扱いにする。

- 複数の type が同じ程度に妥当
- 英語の slug を安全に決められない
- Issue 番号を付けるべきか不明
- 既存のローカルまたはリモート branch と衝突する
- 提案だけでよいか、作成まで進めるべきか不明

曖昧な場合は、候補 branch name と確認事項を返し、
確定や作成に進まない。

## Choose One Branch Type

1 つの branch に対して役割を 1 つ選ぶ。
type は以下から最も近いものを使う。

- `feature/`: 新機能の開発
- `bugfix/`: バグ修正
- `hotfix/`: 緊急のバグ修正
- `release/`: リリース準備
- `docs/`: ドキュメントの変更
- `style/`: 振る舞いに影響しない整形
- `refactor/`: 構造変更
- `test/`: テストの追加や修正
- `chore/`: 補助ツールや依存関係の更新

## Write The Description Slug

description は次の規則で書く。

- 英語を使う
- kebab-case を使う
- 小文字で始める
- 短く、かつ内容が分かる形にする
- 冠詞や不要語を省く
- 変更結果ではなく作業内容を表す
- 自信が持てない機械的なローマ字化をしない

英語表現に自信がない場合は、推測で確定せず、
候補と確認事項を返して止まる。

## Add The Issue Number Only When Needed

関連する Issue がある場合だけ、description の前に番号を付ける。
形式は `<type>/<issue-number>-<description>` とする。

Issue 番号が不要なら `<type>/<description>` を使う。

## Propose One Final Candidate

通常は最終候補を 1 つ返す。
代替案が有益なら、候補は 1 つまで追加する。

返答では branch name をコードブロックで明示する。

```text
chore/update-markdown-lint-config
```

## Create The Branch Only When Asked

branch を作成するのは、ユーザーが明示的に求めた場合だけにする。
提案だけの依頼なら Git 操作はしない。

作成前に、同名 branch が存在しないことを確認する。
ローカルとリモートのどちらかで衝突したら、作成せずに代替候補を返す。

作成する場合は、対話モードを開かずに `git switch -c` を使う。
`git switch` が使えない環境だけ `git checkout -b` を代替にする。

```bash
git switch -c chore/update-markdown-lint-config
git checkout -b chore/update-markdown-lint-config
```

## Review Before Finishing

終了前に次を確認する。

- type が作業の主目的と一致している
- description が英語、kebab-case、小文字になっている
- Issue 番号を付ける条件と形式が合っている
- 既存 branch と衝突していない
- 明示依頼がないのに branch を作成していない

曖昧さが残る場合は確定せず、確認事項だけを返す。

## Proposed Branch Name Examples

### 新機能の開発

```text
feature/add-user-authentication
```

### バグ修正（Issue 番号あり）

```text
bugfix/123-fix-header-alignment
```

### メンテナンス作業

```text
chore/update-markdown-lint-config
```
