# Guidelines

## 最優先

- ユーザーとの応答は **必ず日本語（です/ます調）** で行う。
- まず結論。前置きや過剰な謝罪は不要。

## Skills

- `skills/task-intake/` — 着手前に目的・完了条件・制約・前提を整理し、
  推奨アプローチを固める
- `skills/full-cycle-delivery/` — 曖昧な依頼を整理し、必要な skill を束ねて
  最小変更・十分な検証・明確な報告まで主導する
- `skills/repo-discovery/` — リポジトリ構成・主要コマンド・規約・変更候補を
  素早く把握する
- `skills/code-review/` — findings-first で差分や Pull Request をレビューし、
  問題点を重大度順に指摘する
- `skills/refactoring/` — 安全網を前提に振る舞いを変えず、
  構造改善を小さく進める
- `skills/coding-standards/` — TypeScript・JavaScript・React・Node.js・
  Rust・Terraform の基本的な実装規約を揃える
- `skills/typescript-practice/` — TypeScript の実装・型エラー修正・
  `tsconfig` 整備時に、`package.json` / lockfile / scripts を確認して
  最小差分で進める
- `skills/rust-practice/` — Rust の実装・リファクタ・Edition 移行時に、
  `Cargo.toml` / toolchain / MSRV を確認して `cargo` 系の検証を揃える
- `skills/terraform-practice/` — Terraform の構成変更やレビュー時に、
  `fmt` / `validate` / `plan` と安全ガードを前提に進める
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

## 迷ったときの使い分け

- 依頼全体の進め方を先に固定したいときは `$full-cycle-delivery` を使う
- 目的・完了条件・制約だけを整理したいときは `$task-intake` を使う
- 横断的な実装規約は `$coding-standards`、技術別の具体手順は
  `$typescript-practice`、`$rust-practice`、`$terraform-practice` を使う
- 振る舞い変更を test-first で進めるときは `$tdd` を使う
- 振る舞いを変えない構造改善を進めるときは `$refactoring` を使う

## 標準ワークフロー

依頼を進めるときは、原則として次の順序で扱う。

1. 依頼全体の進め方に迷う場合は、まず `$full-cycle-delivery` で
   完了条件・タスク分類・必要 skill を固定する
2. 目的や制約が曖昧なら `$task-intake` を使う
3. リポジトリ構成や主要コマンドが不明なら `$repo-discovery` を使う
4. implementation / documentation を進める
   - 振る舞い変更を伴う実装では原則 `$tdd` を併用する
   - 振る舞いを変えない構造改善では `$refactoring` を併用する
   - TypeScript / Rust / Terraform を扱う作業では、対象技術に対応する
     practice skill を併用する
   - 実装規約の統一が必要なら `$coding-standards` を併用する
5. 仕上げに `$code-review` で差分の抜け漏れを点検する
6. 公開が必要な場合のみ、`$conventional-branching`、
   `$conventional-commits`、`$github-pr-create` をつなぐ

順序を変える場合や step を省略する場合は、理由を返答で明示する。

次のケースでは、標準ワークフローを条件付きで扱う。

- レビューのみの依頼では implementation を飛ばしてよい
- docs / 文言 / 設定変更や skill 更新では、通常 `$tdd` を使わない
- commit / PR はユーザーの明示依頼がある場合だけ行う

## マルチエージェント

- `.codex/agents/explorer.toml` — 読み取り専用の証拠収集
- `.codex/agents/reviewer.toml` — 正しさ・セキュリティレビュー
- `.codex/agents/docs-researcher.toml` — API・外部仕様・リリースノート検証
