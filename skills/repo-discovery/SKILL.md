---
name: repo-discovery
description: リポジトリの全体像を素早く把握する skill。ディレクトリ構成・
  主要エントリポイント・テスト/lint/build コマンド・規約・依存・
  変更候補と未解決事項を整理したいとき、実装・レビュー・計画の前段で使う。
---

# Repo Discovery

## Inspect The Repository First

作業を始める前に次を確認する。

- リポジトリのルートにある設定ファイル
  例: `package.json`、`Makefile`、`pyproject.toml`、`go.mod`
- `README.md` や `AGENTS.md`、`CONTRIBUTING.md` などのドキュメント
- `.github/` や `.codex/` などのメタディレクトリの有無

目的を把握する前に変更や提案を始めない。

## Map The Directory Structure

ディレクトリ構成を把握する。

- トップレベルのディレクトリ一覧を取得し、役割を推定する
- `src/`・`lib/`・`app/`・`packages/` などのソースルートを特定する
- `tests/`・`__tests__/`・`spec/` などのテストディレクトリを特定する
- モノレポの場合はワークスペース構成を確認する

## Identify Entry Points

エントリポイントを確認する。

- `main`・`bin`・`exports` フィールドをパッケージマニフェストから読む
- フレームワーク固有の規約（`pages/`、`app/`、`cmd/` など）を確認する
- CLI ツールの場合は実行可能スクリプトのパスを特定する
- サーバーやワーカーの起動コマンドを確認する

## Confirm Verification Commands

検証コマンドを確認する。

- `test`・`test:watch`・`test:coverage` などのスクリプトを確認する
- テストフレームワーク（Jest、Vitest、pytest、go test など）を特定する
- `lint`・`format`・`build`・`typecheck` などのスクリプトを確認する
- CI 設定（`.github/workflows/`）で自動実行されているコマンドを確認する

## Identify Conventions And Dependencies

主要な規約と依存を確認する。

- `dependencies`・`devDependencies` から主要ライブラリとバージョンを読む
- コーディング規約ドキュメント（`rules/`、`AGENTS.md` など）を確認する
- `.editorconfig`・`.prettierrc` などのフォーマット設定を確認する
- 言語バージョンやランタイムの制約（`.node-version`、`.python-version`
  など）を確認する

## Narrow Change Candidates

変更対象候補を洗い出す。

- 依頼の目的に関連するディレクトリ・ファイルを絞り込む
- 変更が波及しやすい共有モジュールや公開 API を特定する
- 変更リスクが高い箇所や、確認不足の領域を把握する
- 変更前に確認すべき依存関係や呼び出し元を列挙する

## Treat Uncertainty Explicitly

不確実な点は、推測で埋めずに明示する。

- ディレクトリ構成やエントリポイントが複数あり、主体が断定できない
- test や lint のコマンドが見当たらない
- 規約ドキュメントが存在せず、既存コードからも十分に読み取れない

- 候補が複数ある場合は、候補と根拠を並べて返す
- 確認できない項目は `不明` として残す
- 次に掘るべき観点やコマンドを 1 つ示す

## Return A Structured Summary

返答では次を揃える。

- repo の構成と主要ディレクトリ
- 実行可能な test / lint / build / typecheck コマンド
- 主要な規約と依存
- 変更候補と注意すべき共有地点
- 未解決事項と、次に行う調査

## Pair With Other Skills

目的に応じて次の skill とつなぐ。

- 依頼の意図整理が先に必要な場合: `$task-intake`
- 差分レビュー前に文脈が必要な場合: `$code-review`
- リファクタリング前に安全な変更単位を探す場合: `$refactoring`

## Review Before Finishing

返答前に次を確認する。

- ディレクトリ構成・エントリポイント・検証コマンド・
  規約/依存・変更候補・未解決事項を整理した
- 確認できなかった項目は「不明」として明示している
- 変更候補は依頼の目的に対して絞り込まれている
- 次のアクションが明確に示されている
