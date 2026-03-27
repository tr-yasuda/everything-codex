# Guidelines

## 最優先

- ユーザーとの応答は **必ず日本語（です/ます調）** で行う。
- まず結論。前置きや過剰な謝罪は不要。

## Skills

- `skills/task-intake/` — 着手前に目的・完了条件・制約・前提を整理し、
  推奨アプローチを固める
- `skills/repo-discovery/` — リポジトリ構成・主要コマンド・規約・変更候補を
  素早く把握する
- `skills/code-review/` — findings-first で差分や Pull Request をレビューし、
  問題点を重大度順に指摘する
- `skills/refactoring/` — 安全網を前提に振る舞いを変えず、
  構造改善を小さく進める
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

## 標準ワークフロー

バグ修正・機能追加・リファクタ・レビュー対応などのコード変更タスクでは、
原則として次の順序で進める。

1. `$repo-discovery`
2. `$task-intake`
3. implementation（原則として `$tdd` を併用する。
   docs / 文言 / 設定変更など、自動テストで振る舞いを固定しない変更は除く）
4. `$code-review`
5. 公開が必要な場合のみ、`$conventional-commits` と
   `$github-pr-create`

順序を変える場合や step を省略する場合は、理由を返答で明示する。

次のケースでは、標準ワークフローを条件付きで扱う。

- レビューのみの依頼では implementation を飛ばしてよい
- docs / 文言 / 設定変更では、通常 `$tdd` を使わない
- commit / PR はユーザーの明示依頼がある場合だけ行う

## マルチエージェント

- `.codex/agents/explorer.toml` — 読み取り専用の証拠収集
- `.codex/agents/reviewer.toml` — 正しさ・セキュリティレビュー
- `.codex/agents/docs-researcher.toml` — API・リリースノート検証
