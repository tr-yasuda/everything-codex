---
name: frontend-patterns
description: React、UI、frontend state、hooks、rendering、accessibility の実装で必ず守る frontend 規約。component 境界、composition、狭い state、effect 分離、表示状態、操作可能性を強制する。画面、component、hook、frontend state、UI 挙動を変更するときに使う。
---

# Frontend Patterns

## Purpose

frontend 実装時に守る UI、state、hooks、rendering の規則を定義する。
この規則への違反を残したまま、完了報告してはいけない。

## Use With

- 必ず `coding-standards` も使う。
- TypeScript / JavaScript では `typescript-practice` も使う。

## Component Boundaries

- component に表示、データ取得、変換、ドメイン判断、副作用を混在させてはいけない。
- domain logic は component から分離し、関数または module に置く。
- component は props を変更してはいけない。
- boolean prop を増やして巨大な設定 component にしてはいけない。
- 構成可能な UI は、props の増殖ではなく composition で表現する。
- render helper が hooks、副作用、非自明な業務ロジック、深い JSX を持ってはいけない。

## State And Effects

- state は利用箇所に近く、狭く置く。
- 無関係な state を 1 つの context、hook、store に束ねてはいけない。
- 無関係な `useEffect` を 1 component に溜めてはいけない。
- effect は 1 つの目的だけを持つ。
- subscription、timer、listener、async 処理には cleanup を書く。
- unmount 後に state を更新する async flow を作ってはいけない。
- derived state を別 state として重複保持してはいけない。

## Rendering

- render 中に I/O、副作用、重い計算を置いてはいけない。
- list には安定した key を使う。
- index key は、並び替え、追加、削除が起きない静的 list でしか使ってはいけない。
- 不要な再描画を生む subscription や props バケツリレーを作ってはいけない。
- memoization は、現在の測定結果または明確な再描画原因で説明できる場合だけ使う。

## UX Completion

- loading、empty、error、disabled の必要状態を実装する。
- 操作可能要素は keyboard、screen reader、focus を壊してはいけない。
- text、button、input は mobile と desktop の幅で破綻してはいけない。
- destructive action は誤操作を防ぐ UI にする。
- async action は二重送信を防ぐ。

## Completion

- UI 変更では、主要状態と操作不能状態を確認する。
- 確認できない viewport、状態、操作がある場合は報告する。
