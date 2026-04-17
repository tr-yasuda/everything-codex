---
name: typescript-practice
description: TypeScript の実装/リファクタ/レビュー/型エラー修正/tsconfig整備を行うときに、package.json/lockfile を確認してコマンド（typecheck/lint/format/test）を決め、必須コーディング規約に従って差分最小で修正する。TypeScript, ts, tsconfig, eslint, prettier, biome, lockfile, package.json, コーディング規約, 型エラー の相談で使う。
---

# TypeScript Practice

## 目的

- TypeScript の変更を一貫した規約に収束させる
- 変更前に `package.json` / lockfile を確認し、プロジェクトの前提（PM/スクリプト/TS設定/リンタ/フォーマッタ）を把握する

## 優先順位

1. ユーザーの明示指示
2. リポジトリ内の既存規約と設定ファイル
3. 基本的なコーディング規約: `$coding-standards`
4. 本スキルの詳細規約: `references/coding-guidelines.md`

## クイックスタート（毎回）

1. `README` / `CONTRIBUTING` / `Makefile` を読む（存在するものだけ）。
2. `package.json` を読み、lockfile（`pnpm-lock.yaml`、`yarn.lock`、`package-lock.json`、`bun.lockb`、`bun.lock`）の存在を確認する。
3. パッケージマネージャを確定する（優先順）:
   - `package.json#packageManager`
   - lockfile の種類
4. `package.json#scripts` を見て、既存のスクリプト（`typecheck`/`lint`/`format`/`test`/`build`）を優先して使う。
5. 主要設定（存在するものだけ）を読む: `tsconfig*.json`、`eslint*`、`biome.json`、`prettier*`。
6. 基本規約を確認する: `$coding-standards`。
7. 関心の分離、状態とロジックの分離、コントラクト層の明示を
   `$coding-standards` で確認する。
8. 詳細規約を確認する: `references/coding-guidelines.md`。
9. 変更を入れる（差分最小）。可能なら `typecheck`、`lint`、
   `format`、`test` の順に確認する。

## package.json / lockfile の確認ルール

- lockfile は勝手に編集しない。依存関係の追加や更新、`packageManager` の変更が必要なら、事前にユーザーへ確認する。
- lockfile の中身確認が必要な場合は、目的に必要な範囲だけを最小限で確認する。
- lockfile が複数ある、または `package.json#packageManager` と矛盾する場合は、どれを正とするかユーザーに確認する。
- monorepo の場合は、対象パッケージ（例: `packages/*`）の `package.json` を確認する。

## コマンド選択（例）

- `pnpm` の場合: `pnpm run <script>`
- `yarn` の場合: `yarn run <script>`
- `npm` の場合: `npm run <script>`
- `bun` の場合: `bun run <script>`

## 完了条件（DoD）

- `references/coding-guidelines.md` に違反しない
- 関心の分離、状態とロジックの分離、
  コントラクト層の明示を満たしている
- 可能なら `typecheck`/`lint`/`format`/`test` のすべてで確認できている
