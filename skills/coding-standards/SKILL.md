---
name: coding-standards
description: 実装、修正、リファクタ、レビューで必ず守る共通コーディング規約。責務分離、具体的な命名、最小実装、境界検証、型逃げ禁止、副作用の隔離を強制する。TypeScript、JavaScript、React、Node.js、Rust、Terraform など、言語やフレームワークを問わずコードを変更するときに使う。
---

# Coding Standards

## Purpose

実装時に守る共通ルールを定義する。
この規則への違反を残したまま、完了報告してはいけない。

## Use With

- TypeScript / JavaScript では `typescript-practice` も使う。
- Rust では `rust-practice` も使う。
- Terraform では `terraform-practice` も使う。
- frontend 変更では `frontend-patterns` も使う。
- backend 変更では `backend-patterns` も使う。

## Required Rules

- 1 ファイルには 1 つの主要責務だけを置く。
- ファイル名と主要責務を一致させる。
- 変更理由が異なる処理を同じ module に置いてはいけない。
- データ取得、状態更新、表示、変換、検証、副作用を同じ単位へ詰め込んではいけない。
- 純粋な判断、変換、検証は I/O や状態更新から分離する。
- 外部入力、API 応答、DB 結果、ファイル、環境変数は境界で検証する。
- 公開 API、公開型、schema、DTO は実装都合から分離する。
- 既存のテスト保護範囲を狭めてはいけない。

## Naming

- 変数名は、型ではなく「何を表す値か」が分かる名前にする。
- 関数名は、戻り値ではなく「何をするか」が分かる動詞句にする。
- boolean は `is`、`has`、`should`、`can` で始める。
- `data`、`item`、`value`、`flag`、`temp`、`result` は、意味が特定できない文脈で使ってはいけない。
- 略語は、既存コードまたは対象ドメインで定着しているものだけ使う。

## Forbidden

- 未要求の抽象化、分岐、設定、型、ファイルを追加してはいけない。
- 現在の仕様、現在のテスト、既存の重複で説明できない共通化をしてはいけない。
- 将来使いそうという理由だけでコードを書いてはいけない。
- clever な実装で読み手の推論量を増やしてはいけない。
- 型エラーを `any`、二重 assertion、非 null assertion、抑制コメントで隠してはいけない。
- 例外を握りつぶしてはいけない。
- secret、token、個人情報をログへ出してはいけない。

## Completion

- 上記違反が残る場合は、完了報告の前に修正する。
- 修正できない違反がある場合は、理由、影響範囲、残リスクを報告する。
- 検証できない場合は、実行できなかった検証と残リスクを報告する。
