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

### 開発ワークフロー

- `development-workflow`: 設計、計画、TDD、レビュー、検証を接続し、
  機能追加や修正を完了まで進める。
- `designing-changes`: 曖昧な要求から期待する振る舞い、制約、
  設計上の選択を整理する。
- `planning-changes`: 複数工程の変更を、検証可能な振る舞い単位の
  実装計画に分ける。
- `systematic-debugging`: 再現と仮説検証によって不具合の原因を特定する。
- `tdd`: 公開インターフェースの振る舞いを検証しながら、
  Red-Green-Refactor を進める。
- `reviewing-changes`: 要求との一致、回帰、テストの有効性を点検する。
- `verifying-changes`: 完了報告前に最終差分と検証結果を照合する。

### Git / PR 運用

- `using-git-worktrees`: 現在の checkout を汚さず、独立した作業場所を
  安全に用意する。
- `finishing-changes`: 変更を確認して commit、push、PR 作成、統合までを
  依頼された到達点に合わせて仕上げる。
- `responding-to-review`: レビュー指摘の妥当性を確認し、修正、再検証、
  対応内容の整理を進める。

詳細は各 `skills/<name>/SKILL.md` を参照してください。

## 開発フロー

- skill やドキュメントを変更したら、関連する説明も同時に更新する。
- 変更後は `pnpm lint:md`、`pnpm lint:spell`、`pnpm lint:text` を実行する。
- commit メッセージは `feat:`、`fix:`、`docs:`、`chore:` などの
  Conventional Commit ベースを前提とする。
- Pull Request は `.github/PULL_REQUEST_TEMPLATE.md` に沿って作成する。

## ライセンス

MIT License です。詳細は `LICENSE` を参照してください。
