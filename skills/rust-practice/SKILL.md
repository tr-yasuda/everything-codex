---
name: rust-practice
description: Rust の実装/リファクタ/レビュー/ビルド失敗修正/Edition 移行を標準手順で進めるためのスキル。`Cargo.toml`/`Cargo.lock`/`rust-toolchain.toml` を確認し、MSRV と Edition 2024 を前提に `cargo check/test/fmt/clippy/doc` で品質を担保するときに使う。Rust, cargo, clippy, rustfmt, workspace, MSRV, unsafe, edition の相談で使う。
---

# Rust Practice

## 目的

- Rust の変更手順と品質基準を揃える。
- Edition 2024 と MSRV を明示し、再現可能な検証フローで回帰を防ぐ。
- `unsafe`・公開 API・依存更新のような事故りやすい領域を安全に進める。

## 優先順位

1. ユーザーの明示指示
2. リポジトリ内の既存規約と設定ファイル
3. 基本的なコーディング規約: `$coding-standards`
4. 本スキルの詳細規約: `references/coding-guidelines.md`
5. Edition 2024 への移行: `references/migration-2024.md`

## クイックスタート（毎回）

1. `README` / `CONTRIBUTING` / `Makefile` / CI を確認し、リポジトリの正を決める。
2. `Cargo.toml` / `Cargo.lock` / `rust-toolchain.toml`（または `rust-toolchain`）を確認する。
3. workspace の場合は対象 crate を確定する（`default-members` / `members` / `-p` の使い分け）。
4. 基本規約を確認する: `$coding-standards`。
5. 詳細規約を確認する: `references/coding-guidelines.md`。
6. 差分最小で実装する。公開 API 変更と `unsafe` の有無を明示する。
7. 可能なら次の順で検証する。
   - `cargo check --workspace --all-targets`
   - `cargo test --workspace --all-targets`
   - `cargo fmt --all -- --check`
   - `cargo clippy --workspace --all-targets --all-features -- -D warnings`
   - `cargo doc --workspace --no-deps`
8. 省略した検証がある場合は、理由と残リスクを報告する。

## Cargo.toml / Cargo.lock 確認ルール

- 新規 crate の `edition` は原則 `2024` を使う。
- `rust-version`（MSRV）は必ず明示し、CI と合わせる。
- workspace ルートが virtual manifest の場合は `resolver = "3"` を明示する。
- `Cargo.lock` は手編集しない。依存更新由来の差分のみ許容する。
- 依存更新は目的を限定する（必要以上の一括更新を避ける）。

## コマンド選択（例）

- 全 crate を検証: `cargo check --workspace --all-targets`
- 単一 crate を検証: `cargo check -p <crate>`
- 主要 feature を含めて検証:
  `cargo clippy --workspace --all-targets --all-features -- -D warnings`
- デフォルト feature なし検証: `cargo check -p <crate> --no-default-features`
- Edition 移行の自動補助: `cargo fix --edition --workspace --all-features`

## 相談の振り分け（迷ったら）

- 命名、エラー処理、`unsafe`、公開 API の作法: `references/coding-guidelines.md`
- 実装から検証までの手順、CI での回し方: `references/workflow.md`
- 旧 Edition から 2024 への移行: `references/migration-2024.md`

## 完了条件（DoD）

- `references/coding-guidelines.md` の必須ルールに違反しない。
- 可能な範囲で `check` / `test` / `fmt` / `clippy` / `doc` を通す。
- `unsafe` を追加・変更した場合は安全性の前提を説明できる。
- 公開 API を変更した場合は破壊的変更の有無を説明できる。
