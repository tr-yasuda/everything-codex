---
name: coding-standards
description: TypeScript、JavaScript、React、Node.js、Rust、Terraform の実装・修正・レビューで、
  既存プロジェクト規約を優先しながら、型安全性、命名、変更粒度、
  エラーハンドリングを揃える skill。新規コードを書くとき、
  既存コードを改善するとき、レビュー対応をするとき、一貫した規約で
  最小差分の変更を返したいときに使う。
---

# Coding Standards

## Inspect The Project Context First

最初に次を確認する。

- 対象ファイルの言語、実行環境、フレームワーク
- 近い責務の既存実装、命名、例外処理、テストの書き方
- `tsconfig.json`、`eslint.config.*`、`Cargo.toml`、`*.tf` 等の設定ファイル
- 変更が公開 API を含むか、内部実装だけか
- 最小で回せる test / lint / typecheck / plan の単位

規約を確認する前に、好みのスタイルへ寄せない。
既存ルールが見つからない場合だけ、この skill の既定値を使う。

## Treat Project Conventions As Higher Priority

規約の優先順位は次の順にする。

1. ユーザーの明示指示
2. リポジトリ内の既存規約と設定ファイル
3. この skill の既定値
4. 専門的な Practice（`$typescript-practice`, `$rust-practice`, `$terraform-practice`）

次を守る。

- 周辺コードが採用しているパターンを優先する
- 無関係な rename、全面整形、ついでの抽象化を混ぜない
- 既存ファイルが意図的に古い書き方でも、依頼に不要なら周辺まで広げて直さない
- ルール違反の修正でも、影響範囲は依頼上必要な最小限に留める

## Treat Ambiguity As A Stop Signal

次のケースは曖昧扱いにする。

- リポジトリ内に複数の有力パターンがあり、優先度を決められない
- 型、命名、API 互換性の期待値が読み取れない
- test / lint / typecheck / plan のどれを回すべきか決められない
- 振る舞い変更と整理だけの変更が同じ差分に混ざる

曖昧な場合は、不足情報と候補を示して止まる。
推測で規約や互換性を固定しない。

## Apply Only The Relevant Standards

TypeScript、JavaScript、React、Node.js、Rust、Terraform のうち、
対象に関係する節だけを適用する。
該当しない技術の規約まで横展開しない。
より専門的な手順や詳細規約が必要な場合は、以下の専用スキルを併用する。

- TypeScript: `$typescript-practice`
- Rust: `$rust-practice`
- Terraform: `$terraform-practice`

## Prefer Type-Safe TypeScript

TypeScript では次を優先する。

- `any` を避け、必要なら `unknown` と型ガードで絞り込む
- export する関数、公開 API、共有型には明示的な型を書く
- repo に `enum` 規約がない場合は、`as const` と union を優先する
- 非同期処理は `async/await` と `Promise` ベースで揃える
- 既存の utility type や domain type があるなら再利用する

```typescript
const STATUS = {
  Active: 'active',
  Inactive: 'inactive',
} as const;

type Status = (typeof STATUS)[keyof typeof STATUS];
```

## Keep JavaScript Predictable

JavaScript では次を優先する。

- 新規コードに `var` を導入しない
- 再代入が不要なら `const` を使う
- repo の module 形式に合わせて `import` / `export` を使う
- 文字列連結より template literal を使う
- 共有データの更新は不変操作を優先する
- 短くても読みにくいワンライナーより、明快な分岐を選ぶ

```javascript
const updatedUser = { ...user, name: 'New Name' };
const nextItems = [...items, newItem];
```

## Keep React Code Intentional

React では次を優先する。

- 既存の component / hook パターンに合わせる
- 新規コードは関数コンポーネントを基本にする
- Props、state、side effect の境界を曖昧にしない
- `useEffect` の依存配列は明示し、例外は既存の suppress ルールに合わせる
- 複雑さが下がる場合だけ component や hook を分割する

1 ファイル 1 コンポーネントのような強い整理規則は、
repo 側に明示ルールがある場合だけ適用する。

## Keep Node.js Code Operationally Safe

Node.js では次を優先する。

- 非同期 I/O は `async/await` を使う
- エラーは文脈付きで捕捉し、未処理の rejection を残さない
- repo に設定モジュールがあるなら、`process.env` を直接散らさない
- パスは `path.join` や `path.resolve` を使う
- stream や subprocess を使う場合は error を必ず扱う

## Use Consistent Naming

命名は周辺コードの規約を最優先にし、
既定値が必要な場合は次を使う。

- 変数・関数: camelCase
- 型・クラス・React component: PascalCase
- utility 系ファイル・ディレクトリ: kebab-case
- 定数: repo の慣習に合わせて `UPPER_SNAKE_CASE` または camelCase

`data`、`info`、`temp` のような曖昧名は避ける。
実装都合ではなく、ドメインの意味で名前を付ける。

## Write Comments That Add Value

コメントは「あると親切」ではなく、
コードだけでは伝わりにくい背景や制約を補うために書く。

- 公開 API、複雑な分岐、非自明な workaround では、何をしているかより「なぜそうするか」を書く
- ビジネスルール、外部制約、性能・安全性の前提など、コードから読み取りにくい判断理由を残す
- TODO や FIXME は、必要な対応内容や条件が分かる形で具体的に書く
- コードをそのまま言い換えるだけの説明コメントは書かない
- 変更時はコメントも一緒に見直し、古い説明を残さない

短い補足で意図が伝わるなら、長いコメントブロックよりそちらを優先する。

## Keep Changes Small And Explicit

変更は次を守る。

- 依頼を満たす最小差分で直す
- 振る舞い変更とリファクタリングは、できるだけ分ける
- helper 抽出は、再利用性か可読性の改善が明確な場合だけ行う
- 値に意味がある、または再利用される場合だけ名前付き定数へ置き換える
- style 修正だけの差分を、機能変更へ抱き合わせない

## Handle Errors Explicitly

エラー処理は次を守る。

- 空の `catch` を作らない
- 失敗理由と対象を含む文脈付きのエラーにする
- ユーザー向けメッセージと診断ログを分ける
- 使える環境では `cause` などで元エラーを保持する

```typescript
try {
  return await fetchUser(id);
} catch (error) {
  logger.error('Failed to fetch user', { id, error });
  throw new AppError('ユーザーの取得に失敗しました', { cause: error });
}
```

## Pair With TDD When The Request Is Test-First

ユーザーが Red-Green-Refactor や test-first を明示した場合は、
`$tdd` と連携する。

- failing test と最小テスト単位の決定は `$tdd` に委ねる
- この skill は、そのサイクルで適用する規約だけを絞って使う
- 規約に沿った整理を理由に、Red-Green-Refactor を飛ばさない

## Keep This Skill Focused

この skill はコード品質と一貫性を扱う。
次は専用 skill に委ねる。

- Red-Green-Refactor を明示的に回す変更: `$tdd`
- branch 命名と作成: `$conventional-branching`
- commit 作成: `$conventional-commits`
- PR 作成: `$github-pr-create`

## Review Before Finishing

返答前に次を確認する。

- 変更が既存規約と衝突していない
- export する型や公開 API が明示的で互換性を壊していない
- 命名、error handling、side effect が一貫している
- 不要なコメント、デバッグログ、未使用 import が残っていない
- 実行した test / lint / typecheck を明示している
- 実行していない確認項目があれば、その理由を共有している
