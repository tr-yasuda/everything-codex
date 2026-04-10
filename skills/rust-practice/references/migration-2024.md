# Edition 2024 移行ガイド（Rust）

このガイドは、既存 crate を Edition 2024 へ移行する際の安全な進め方を定義します。

## 事前条件

- 既存 edition で `cargo check` と `cargo test` が通っている。
- 変更対象 crate と依存関係が特定できている。
- 一度に広げすぎず、crate 単位で段階移行する方針を持つ。

## 推奨手順

1. 自動修正を適用する。  
   `cargo fix --edition --workspace --all-features`
2. `Cargo.toml` の `edition` を `2024` に更新する。
3. `cargo check --workspace --all-targets` を実行し、コンパイルエラーを解消する。
4. `cargo test --workspace --all-targets` と
   `cargo clippy --workspace --all-targets --all-features -- -D warnings` を通す。
5. `cargo fmt --all -- --check` を通す。

## 重点確認ポイント

- `unsafe extern` を要求される箇所がないか。
- `unsafe` 属性が必要な箇所を見落としていないか。
- `unsafe fn` 内で危険操作を明示的な `unsafe {}` で囲めているか。
- 以前は安全だった API の一部が `unsafe` 扱いになっていないか。
- 一時値スコープや推論挙動の変化で、実行時挙動が変わっていないか。

## workspace 運用

- virtual workspace は `resolver = "3"` を明示する。
- 大規模 workspace では crate ごとに移行し、各段階で CI を通す。
- Edition 移行と依存更新は分けて実施する。

## ロールバック方針

- 移行差分は小さなコミットに分割する。
- 問題が出た場合は該当 crate の edition 変更コミット単位で切り戻せる状態を維持する。

## 完了条件

- Edition 2024 で `check` / `test` / `fmt` / `clippy` が通る。
- `unsafe` 関連の変更点にレビュー可能な説明が付いている。
- 公開 API の挙動差分がレビューで説明できる。
