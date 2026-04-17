# everything-codex

Codex で再利用する skill、リポジトリ運用ルール、GitHub CI 設定を
まとめたワークスペースです。

初見の利用者が「何が入っているか」「どう使い始めるか」
「どう更新するか」を把握しやすいように、実際の構成と運用コマンドを
README に集約しています。

## できること

- Codex で使う skill を `skills/` 配下で管理できる。
- Markdown、スペル、日本語の技術文書の lint を統一できる。
- GitHub Actions と PR テンプレートを含む基本運用を共有できる。

## セットアップ

前提環境は Node.js 24 と `pnpm@10.5.0` です。

```bash
pnpm install --frozen-lockfile
```

`pnpm install --frozen-lockfile` で lockfile に固定された依存関係を
そのままインストールします。

## 主要コマンド

```bash
pnpm lint:md
pnpm lint:spell
pnpm lint:text
```

- `pnpm lint:md`: Markdown の見出しや記法を検証する。
- `pnpm lint:spell`: 固有名詞や用語のスペルを検証する。
- `pnpm lint:text`: 日本語の技術文書としての文章品質を検証する。

PR を作成する前に、上記 3 つを通す前提です。

## ディレクトリ構成

- `skills/`: Codex で再利用する skill 定義を配置する。
- `.github/workflows/`: lint などの GitHub Actions を管理する。
- `.github/PULL_REQUEST_TEMPLATE.md`: PR 作成時のテンプレートである。
- `rules/`: リポジトリ全体で共有するルール類の配置先である。
- `templates/`: 共有テンプレートの配置先である。
- ルート設定ファイル群:
  `package.json`、`cspell.json`、`.markdownlint.json`、
  Textlint 設定ファイルなどを配置している。

## 利用できる Skills

### 進行管理・導線整理

- `full-cycle-delivery`: 依頼全体を整理し、必要な skill を束ねて
  最小変更と必要な検証で完了まで導く。
- `task-intake`: 着手前に目的、完了条件、制約、前提、
  推奨アプローチを整理する。
- `repo-discovery`: リポジトリ構成、主要コマンド、規約、
  変更候補を素早く把握する。

### 実装品質・変更手順

- `coding-standards`: TypeScript、JavaScript、React、Node.js、Rust、
  Terraform にまたがる実装・修正・レビュー規約を揃える。
  実装系 skill に共通する設計原則の正本でもある。
- `tdd`: Red-Green-Refactor の流れでテスト駆動開発を進める。
- `refactoring`: 安全網を前提に、振る舞いを変えずに構造改善を進める。
- `code-review`: findings-first で差分や Pull Request をレビューする。
  9 観点（正確性、セキュリティ、パフォーマンス、後方互換性、
  可観測性、運用性、テスト容易性、可読性、一貫性）を
  重大度順に指摘する。

### 言語別 Practice

- `typescript-practice`: TypeScript の実装、型エラー修正、`tsconfig`
  整備を標準手順で進める。
- `rust-practice`: Rust の実装、リファクタ、Edition 移行、
  ビルド失敗修正を標準手順で進める。
- `terraform-practice`: Terraform の構成変更、レビュー、`plan` までの
  安全な運用手順を揃える。

### Git / PR 運用

- `conventional-branching`: 作業内容や Issue 番号から規約に沿った
  ブランチ名を提案する。
- `conventional-commits`: 変更内容を確認し、Conventional Commits 形式で
  commit をまとめる。
- `github-pr-create`: 現在のブランチから Pull Request の準備と作成を
  進める。
- `github-pr-response`: Pull Request で受けたレビューコメントへの対応を
  進める。

詳細は各 `skills/<name>/SKILL.md` を参照してください。

## 開発フロー

- skill やドキュメントを変更したら、関連する説明も同時に更新する。
- 変更後は `pnpm lint:md`、`pnpm lint:spell`、`pnpm lint:text` を実行する。
- commit メッセージは `feat:`、`fix:`、`docs:`、`chore:` などの
  Conventional Commit ベースを前提とする。
- Pull Request は `.github/PULL_REQUEST_TEMPLATE.md` に沿って作成する。

## ライセンス

MIT License です。詳細は `LICENSE` を参照してください。
