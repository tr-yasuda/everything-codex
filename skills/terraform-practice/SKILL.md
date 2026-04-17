---
name: terraform-practice
description: Terraform の実装/運用の「やり方」を標準化するためのガイドライン集。構成/モジュール設計/命名/環境分離/backend/state/upgrade/import/moved/レビュー観点、および `terraform fmt/validate/plan/apply` と周辺ツール（tflint、tfsec、checkov、terraform-docs、infracost、pre-commit、CI）の使い方の相談に使う。
---

# Terraform Practice

## 目的

- Terraform の変更手順と品質基準（レビュー観点）を揃える。
- 事故りやすい操作（`apply`/`destroy`/state 操作/`import`）を安全に進める。
- ツールチェーン（lint / security scan / cost / CI）を迷わず使えるように
  することを目指す。

## 優先順位

1. ユーザーの明示指示
2. リポジトリ内の既存規約と設定ファイル
3. 基本的なコーディング規約: `$coding-standards`
4. 本スキルの詳細規約: `references/code-guidelines.md`

## クイックスタート（毎回）

1. 変更の目的を言語化する（何を/なぜ/どの環境で）。
2. 前提を確認する（Terraform / provider のバージョン、backend/state、実行権限、`terraform.lock.hcl`）。
3. 基本規約を確認する: `$coding-standards`。
4. 関心の分離、状態とロジックの分離、
   コントラクト層の明示を `$coding-standards` で確認する。
5. 詳細規約を確認する: `references/code-guidelines.md`。
6. ツール類（`tflint`, `tfsec` 等）が必要なら `references/tooling.md` を確認する。
7. ローカルで `fmt` → `validate` → `plan` まで通す。
8. 差分を `references/review-checklist.md` で点検する。
9. `apply` は明示合意のうえで実行する（可能なら `plan`
   生成物を使って再現性を担保する）。

## 安全ガード（常に守る）

- 破壊的操作（`apply`/`destroy`/`terraform state *`/`import`/`state rm`）は、
  ユーザーの明示指示がない限り実行しない。
- まず `plan` を作り、差分の意味が説明できる状態にする（説明できない差分は止めて調べる）。
- tfstate（`*.tfstate`/`*.tfstate.backup`）を Git にコミットしない。共有は remote backend + ロック（排他）前提で運用する。
- 実行対象（ディレクトリ/ワークスペース/var-file）が正しいことを毎回確認する。
- `terraform.lock.hcl` は手編集しない。更新が必要なら `init` 由来の差分であることを
  確認する。

## 相談の振り分け（迷ったら）

- 実行手順（`init`/`plan`/`apply`/`import`/state）: `references/workflow.md`
- 設計/命名/モジュール/変数/秘匿: `references/code-guidelines.md`
- PR レビュー観点（危険サイン/差分の読み方）: `references/review-checklist.md`
- 周辺ツール（lint/scan/docs/cost/pre-commit/CI）:
  `references/tooling.md`

## 参照（必要になったら開く）

- `references/workflow.md`: `init` から `plan/apply`、`import`、state 操作、
  upgrade までの手順
- `references/code-guidelines.md`: 構成、命名、モジュール設計、
  型/validation などの指針
- `references/review-checklist.md`: PR レビューでの確認項目（plan の見方・危険サイン）
- `references/tooling.md`: tflint/tfsec 等の周辺ツールの使い方
