---
name: backend-patterns
description: API、service、validation、database、server-side 処理の実装で必ず守る backend 規約。handler 分離、入力検証、公開契約、data access、transaction、error handling、認証認可、secret 保護を強制する。API、DB、server action、repository、adapter、外部 API 連携を変更するときに使う。
---

# Backend Patterns

## Purpose

backend 実装時に守る API、service、validation、DB 境界の規則を定義する。
この規則への違反を残したまま、完了報告してはいけない。

## Use With

- 必ず `coding-standards` も使う。
- TypeScript / JavaScript では `typescript-practice` も使う。

## Layer Boundaries

- handler に validation、認可、業務ロジック、DB 操作、レスポンス整形を全部入れてはいけない。
- handler は入力を受け、境界処理を行い、service を呼び、返却形式へ写すだけにする。
- service は domain logic を持つ。
- repository / adapter は永続化や外部 API の詳細を閉じ込める。
- domain logic から framework、request、response、DB client の詳細を参照してはいけない。

## Contracts And Validation

- 外部入力は検証してから domain logic へ渡す。
- API response、DTO、schema は公開契約として扱う。
- 公開契約を実装都合で曖昧にしてはいけない。
- 環境変数は起動時または境界で検証する。
- Zod など既存の schema ライブラリがある場合は既存方式に従う。
- 新しい validation library を規約目的だけで導入してはいけない。

## Data Access

- 不要な列や関連データを取得してはいけない。
- `select *` 相当の取得を、必要な理由なしに使ってはいけない。
- N+1 query を作ってはいけない。
- 複数書き込みでは transaction の要否を判断する。
- 冪等性が必要な mutation では idempotency key、一意制約、状態遷移のいずれかで二重実行を防ぐ。
- DB 制約に頼る場合でも、利用者向けエラーへ変換する。

## Errors And Security

- 例外を握りつぶしてはいけない。
- 利用者向けエラーと調査向けログを分ける。
- 認証と認可を mutation より前に行う。
- 権限判定を UI だけに任せてはいけない。
- secret、token、個人情報を response や log に出してはいけない。
- retry は冪等性を確認してから実装する。

## Stack-Specific Rules

- Next.js、REST、Supabase、Zod などは、repo に既に存在する場合だけ扱う。
- 既存 stack の規約、schema、helper、error 型を優先する。
- 新しい framework、library、directory 構成を規約目的だけで導入してはいけない。

## Completion

- API 変更では、入力検証、認可、成功応答、失敗応答を確認する。
- DB 変更では、取得範囲、transaction、制約、migration の要否を確認する。
- 確認できない境界や残リスクがある場合は報告する。
