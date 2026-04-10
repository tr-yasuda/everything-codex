# コーディングガイドライン（TypeScript）

このドキュメントは、このスキルが適用されるリポジトリにおける **必須の TypeScript コーディング規約** を定義します。
人間と AI ツールの双方にとって **曖昧さがなく、強制可能** であることを目的としています。
迷った場合は、このドキュメントに従ってください。

---

## 基本原則（Core Principles）

- 可読性・予測可能性・レビュー容易性を最優先する
- 小手先のテクニックよりも明示性を優先する
- 長期的な保守性を最適化する
- 個人の好みよりも一貫性を優先する

---

## 型定義（Type Definitions）

### ルール

- **常に `type` を使用する**
- **`interface` の使用は禁止**

### 理由

- union / intersection 型との相性が良い
- 宣言マージによる事故を防げる
- リファクタリングや合成が容易

### 型定義の Bad パターン。

```ts
interface User {
  name: string;
  age: number;
}
```

### 型定義の Good パターン。

```ts
type User = {
  name: string;
  age: number;
};
```

---

## 関数（Functions）

### 基本ルール

- **トップレベル関数は `function` 宣言を使用する**
- **名前付き関数は必ず戻り値の型を明示する**
- 不要なアロー関数の使用は避ける

### 補足

- 「トップレベル」とは「モジュールスコープ」（他の関数・クラス・オブジェクト内ではない）を指す
- 「名前付き関数」には `function foo(){}` と `const foo = (): T => {}` の両方を含む
- `.map((x) => ...)` のようなインラインコールバックでは戻り値型を省略してよい

### 理由の確認

- `function` 宣言はスタックトレースを改善する
- 公開ロジック・再利用ロジックの意図が明確になる
- 型推論のドリフトを防ぐ

### 関数の Bad パターン。

```ts
const add = (a: number, b: number): number => {
  return a + b;
};
```

### 関数の Good パターン。

```ts
function add(a: number, b: number): number {
  return a + b;
}
```

---

## アロー関数（使用が許可・推奨されるケース）

以下のケースではアロー関数の使用を許可・推奨する。

### 1. 引数として渡す関数

```ts
const doubled = [1, 2, 3].map((n) => n * 2);
```

### 2. 他の関数内で定義する関数

```ts
function process(items: number[]): number[] {
  const normalize = (value: number): number => value / 100;

  return items.map(normalize);
}
```

### 3. UI フレームワーク（例: React）

- イベントハンドラ
- Hooks のコールバック
- インラインの描画ロジック

```ts
const handleClick = (): void => {
  setCount((prev) => prev + 1);
};
```

---

## UI コンポーネント（Props）

### Props ルール

- **Props の型は Readonly にする**

  - `type Props = Readonly<{ ... }>`（浅い Readonly）を推奨
  - もしくは各フィールドに `readonly` を付与
- Props を変更してはいけない。必要な値はローカルで導出する

### Props の Bad パターン。

```typescript jsx
type Props = {
  count: number;
};

function Counter(props: Props): JSX.Element {
  props.count += 1;
  return <div>{props.count}</div>;
}
```

### Props の Good パターン。

```typescript jsx
type Props = Readonly<{
  count: number;
}>;

function Counter(props: Props): JSX.Element {
  return <div>{props.count}</div>;
}
```

---

## 命名規則（Naming Conventions）

- 変数・関数の命名。
- 型・クラスの命名。
- 定数の命名。

---

## 型安全（Type Safety）

### any の使用禁止。

- **`any` の使用は全面禁止。**
- `unknown` を使用し、適切に型を絞り込む。
- 実行時検証が保証される場合のみ Generics を使用。

```ts
function parseJson(value: string): unknown {
  return JSON.parse(value) as unknown;
}
```

---

## 危険なエスケープ（Unsafe Escapes）

### 型アサーションの禁止

- **`as any` は禁止**
- **`as unknown as T` のような二重アサーションは禁止**
- **非 null アサーション `value!` は禁止**

### TypeScript 抑制コメントの制限

- **`@ts-ignore` は禁止**
- `@ts-expect-error` はインライン説明コメントがある場合のみ許可

```ts
// @ts-expect-error -- サードパーティ型定義が誤っているが、実行時に検証済み
const value: string = thirdPartyValue;
```

### Lint / Formatter 抑制の制限

- `eslint-disable*` / `biome-ignore*` / `prettier-ignore` はインライン説明コメントがある場合のみ許可

---

## 非同期コード（Asynchronous Code）

### 非同期の推奨ルール

- **原則として `async / await` を使用する**

### 非同期で例外として許可されるケース

- 制御フローが直線的な単純な Promise チェーン
- 分岐を持たない Promise を返すユーティリティ関数
- アロケーションコストが重要なパフォーマンスクリティカルな箇所

### 非同期での禁止事項

- 深くネストした `then` / `catch`
- `await` と `then` の混在

### 非同期の Bad パターン。

```ts
fetchData()
  .then((result) => process(result))
  .then((value) => console.log(value));
```

### 非同期の Good パターン。

```ts
async function handleFetch(): Promise<void> {
  const result = await fetchData();
  const value = process(result);
  console.log(value);
}
```

---

## エラーハンドリング（Error Handling）

### エラーハンドリングのルール

- エラーは明示的に処理する
- エラーを握りつぶしてはいけない
- 処理するか、再スローする
- 文脈を追加せずに同じエラーを再スローしてはいけない

### エラーハンドリングの Bad パターン。

```ts
try {
  doSomething();
} catch {
  // 無視
}
```

### エラーハンドリングの Good パターン。

```ts
try {
  doSomething();
} catch (error) {
  throw new Error("doSomething failed", { cause: error });
}
```

---

## 制御構文（Braces）

### 制御構文のルール

- **`if` / `else` / `for` / `while` / `do` / `catch` の本体は、1文でも必ず波括弧 `{}` を付ける**
- **波括弧を省略した1行制御構文は禁止**

### 制御構文で波括弧を必須とする理由

- 変更時に意図しない文が条件分岐の外へ漏れる事故を防げる
- 差分レビュー時の認知負荷が下がる
- ESLint の `curly` ルール（`all`）と整合しやすい

### 制御構文の Bad パターン。

```ts
if (isReady) start();
else stop();

for (const item of items) process(item);

while (retryCount > 0) retryCount -= 1;
```

### 制御構文の Good パターン。

```ts
if (isReady) {
  start();
} else {
  stop();
}

for (const item of items) {
  process(item);
}

while (retryCount > 0) {
  retryCount -= 1;
}
```

---

## Nullish ハンドリング（`??` / `?.`）

`null` および `undefined` を安全・明示的・予測可能に扱うためのルール。

### Nullish ハンドリングのルール

- **欠損値は原則 `undefined` で表現する**
- **新規コードでは `null` の導入を避ける（返り値・引数・プロパティ）**
- **外部境界（API/DB/SDK）由来の `null` は、境界で `undefined` に正規化してから内部へ渡す**
- **`exactOptionalPropertyTypes` を考慮し、Optional プロパティに `prop: undefined` を明示代入しない（欠損はプロパティ省略で表現する）**
- **デフォルト値には `??` を使用する**
- **`||` をデフォルト値として使用することは禁止**
- **安全なプロパティアクセスには `?.` を使用する**
- **デフォルト適用は可能な限りローカルに行う**

  - 必要以上に早い段階で値を正規化しない

### Nullish ハンドリングの理由

- `undefined` を欠損の標準に据えると、型と実装の揺れが減り、レビューしやすくなる。
- `null | undefined` の二重表現を避けることで、判定分岐やテストケースの増加を抑える。
- 境界での正規化により、内部ドメインの前提を単純化できる。
- `??` は `null` と `undefined` のみを対象とするため、意図を正確に表現できる。
- `||` は falsy 値（`0`, `""`, `false`）も欠損とみなしバグの原因になる
- `?.` は防御的な分岐を減らし可読性を向上させる
- ローカルなデフォルト適用はデータの意味を保つ

### 禁止パターン

```ts
const retryCount = config.retryCount || 3;

const name =
  user && user.profile && user.profile.name
    ? user.profile.name
    : "unknown";

type User = {
  middleName: string | null;
};

const items = response.items;
```

### 必須パターン

```ts
const retryCount = config.retryCount ?? 3;

const name = user?.profile?.name ?? "unknown";

type User = {
  middleName?: string;
};

const items = response.items ?? [];
```

### 境界での正規化（外部入力）

```ts
type ApiUser = {
  middleName: string | null;
};

type User = {
  middleName?: string;
};

function fromApiUser(apiUser: ApiUser): User {
  if (apiUser.middleName == null) {
    return {};
  }

  return { middleName: apiUser.middleName };
}
```

### Nullish の例外（`null` を許可するケース）

- 外部仕様（API スキーマ、DB スキーマ、外部 SDK）が `null` を明示的に要求する場合
- `null` と `undefined` の意味を意図的に分ける必要があり、型コメントやドキュメントで説明されている場合

### Nullish の補足

> 「値が未設定の場合のみデフォルトを適用する」
> この要件のときは `??` を使用する。

falsy 値を無効として扱いたい場合は、**明示的にロジックを書くこと**。

```ts
const value = input.trim() === "" ? "default" : input;
```

---

## グローバル参照（Globals）

### グローバル参照のルール

- **グローバルアクセスには `globalThis` を使用する**
- **`window` の使用は禁止**

### グローバル参照の Bad パターン。

```ts
window.setTimeout(() => {
  // ...
}, 1000);
```

### グローバル参照の Good パターン。

```ts
globalThis.setTimeout(() => {
  // ...
}, 1000);
```
