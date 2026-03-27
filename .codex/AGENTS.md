# Guidelines

## 最優先

- ユーザーとの応答は **必ず日本語（です/ます調）** で行う。
- まず結論。前置きや過剰な謝罪は不要。

## Skills

- `skills/coding-standards/` — TypeScript・JavaScript・React・Node.js
  の型安全性・命名・エラーハンドリング
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

## マルチエージェント

- `.codex/agents/explorer.toml` — 読み取り専用の証拠収集
- `.codex/agents/reviewer.toml` — 正しさ・セキュリティレビュー
- `.codex/agents/docs-researcher.toml` — API・リリースノート検証
