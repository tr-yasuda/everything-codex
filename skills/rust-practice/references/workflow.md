# 実装ワークフロー（Rust）

## 0. 目的を固定する

- 何を直すか、なぜ直すか、どの crate が対象かを最初に固定する。
- 変更範囲が複数 crate に跨る場合は、先に境界と責務を決める。

## 1. 事前確認

1. `Cargo.toml` / `Cargo.lock` / `rust-toolchain.toml`（または `rust-toolchain`）を読む。
2. workspace 構成（`members` / `default-members`）を確認する。
3. CI で使っている `cargo` コマンド列を確認し、同等の検証をローカルでも再現する。

## 2. 実装

- 差分最小で実装する。
- リファクタと機能変更を同じコミットに混ぜない。
- 公開 API を変える場合は、破壊的変更かどうかを明記する。
- `unsafe` を追加した場合は、安全性前提をコメントで残す。

## 3. ローカル検証（推奨順）

1. `cargo check --workspace --all-targets`
2. `cargo test --workspace --all-targets`
3. `cargo fmt --all -- --check`
4. `cargo clippy --workspace --all-targets --all-features -- -D warnings`
5. `cargo doc --workspace --no-deps`

workspace 全体では重い場合や確認目的が明確な場合は、次を追加する。

- feature 切り替え確認: `cargo check -p <crate> --no-default-features`
- 特定 crate のみ検証: `cargo test -p <crate>`
- リリース最適化確認: `cargo build --release -p <crate>`

## 4. レビュー前チェック

- 依存更新がある場合、変更目的と影響範囲を説明できるか。
- `Cargo.lock` 差分が意図どおりか。
- `allow` 追加が局所的で、理由コメントがあるか。
- テスト追加が変更点を直接カバーしているか。

## 5. 失敗時の切り分け

- `clippy` 失敗: まず実装で直し、最後の手段として局所 `allow` を使う。
- `test` 失敗: 再現手順を固定し、既存不具合か今回の回帰かを分離する。
- ビルド時間が長い: `-p <crate>` で対象を絞って再現し、最終的に workspace 全体で確認する。

## 6. 完了判定

- 必須コマンドが通過しているか、未実行なら理由が記録されている。
- 破壊的変更の有無が説明されている。
- 追加した `unsafe` と `allow` が最小範囲である。
