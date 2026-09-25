# リポジトリガイド

## 構成

このリポジトリでは、Codex の skill と関連設定を管理します。
アプリケーションコードやアプリケーションのテストはありません。

- `skills/<name>/SKILL.md`: skill の手順を定義する。
- `skills/<name>/agents/openai.yaml`: skill の表示情報と呼び出し設定を定義する。
- `skills/<name>/references/`: skill の補足資料を配置する。
- `.codex/config.toml`、`.codex/agents/`: Codex とエージェントを設定する。
- `.codex/AGENTS.md`: `.codex/` 内の変更に適用する指示を記載する。
- `.github/workflows/`: lint と Pinact のワークフローを配置する。
- `.github/PULL_REQUEST_TEMPLATE.md`: PR の確認項目を定義する。
- ルートの `package.json`、`cspell.json`、`.markdownlint.json`、Textlint 設定ファイル: 文書の検証方法を設定する。

## セットアップと検証

Node.js 24 と `pnpm@10.5.0` を使用します。
依存関係を次のコマンドでインストールします。

```bash
pnpm install --frozen-lockfile
```

PR を作成する前に、次の 3 つのコマンドで検証します。

```bash
pnpm lint:md
pnpm lint:spell
pnpm lint:text
```

順に Markdown の記法、スペル、日本語の文章を検証します。
無関係なファイルで失敗した場合は、対象ファイルと失敗内容を報告します。

## 編集規約

- skill を変更する前に、`README.md` と対象の `SKILL.md` を読む。
  対象パスに `AGENTS.md` があれば、その指示にも従う。
- `.editorconfig` に従い、UTF-8、LF、末尾改行、2 スペースのインデントを使用する。
  Markdown の各行は 120 文字以内に収める。
- skill のディレクトリ名には小文字の kebab-case を使用する。
  `SKILL.md`、`agents/openai.yaml`、README の名称と説明を揃える。
- skill、コマンド、ワークフローを変更したら、関連文書も更新する。
  新しい固有名詞がスペルチェックでエラーになったら、`project-words.txt` か `cspell.json` に登録する。
- 作業ツリーにある無関係な変更は、stage 済みのものも含めて保持する。

## コミットと PR

コミットメッセージは日本語で書きます。
`docs: リポジトリガイドを更新` や `feat(skills): skill を追加` のように書きます。
Conventional Commits 形式の type と scope は英語で記述します。
1 つのコミットには、関連する変更だけを含めます。
PR は `.github/PULL_REQUEST_TEMPLATE.md` に従い、目的、変更内容、
影響範囲、3 つの lint の結果を記載します。
