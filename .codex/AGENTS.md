# Guidelines

## 最優先

- ユーザーとの応答は **必ず日本語（です/ます調）** で行う。
- まず結論。前置きや過剰な謝罪は不要。
- 明示された skill は実行仕様として扱い、別ツールや代替手段を使う場合も
  skill の必須手順を省略しない。

## Skills

- `skills/coding-standards/` — 実装・修正・リファクタ時に必ず使い、
  責務分離、具体的な命名、最小実装、境界検証を強制する
- `skills/frontend-patterns/` — UI、React、frontend state、hooks、
  rendering、accessibility の変更時に必ず使う
- `skills/backend-patterns/` — API、DB、validation、service、
  server-side 処理の変更時に必ず使う
- `skills/typescript-practice/` — TypeScript の実装・型エラー修正・
  `tsconfig` 整備時に、`package.json` / lockfile / scripts を確認して
  最小差分で進める
- `skills/rust-practice/` — Rust の実装・リファクタ・Edition 移行時に、
  `Cargo.toml` / toolchain / MSRV を確認して `cargo` 系の検証を揃える
- `skills/terraform-practice/` — Terraform の構成変更やレビュー時に、
  `fmt` / `validate` / `plan` と安全ガードを前提に進める
- `skills/using-git-worktrees/` — 実装前に `.worktrees/` 配下へ
  作業場所を用意し、現在の checkout を汚さずに作業を始める
- `skills/conventional-branching/` — 作業内容や Issue 番号から
  規約に沿ったブランチ名を提案・作成
- `skills/conventional-commits/` — 変更内容を確認し
  Conventional Commits 形式で `git commit` を作成
- `skills/github-pr-create/` — 現在のブランチから GitHub Pull
  Request を準備・作成
- `skills/github-pr-response/` — PR で受けたレビューコメントへの
  対応を進める
- `skills/tdd/` — Red-Green-Refactor サイクルでテスト駆動開発を
  進める

## Skill 起動規則

- コードを変更する実装タスクでは `coding-standards` を必ず読む。
- frontend 変更では `coding-standards` と `frontend-patterns` を必ず読む。
- backend 変更では `coding-standards` と `backend-patterns` を必ず読む。
- TDD を明示されたときだけ `tdd` を使う。
- `tdd` は `coding-standards` を読むための導線にしない。

## マルチエージェント

- `.codex/agents/explorer.toml` — 読み取り専用の証拠収集
- `.codex/agents/reviewer.toml` — 正しさ・セキュリティレビュー
- `.codex/agents/docs-researcher.toml` — API・外部仕様・リリースノート検証
