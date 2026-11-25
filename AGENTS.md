# リポジトリガイド

## 構成

このリポジトリでは、Codex と Claude Code の skill と関連設定を管理します。
各パスの役割は、[開発者向けガイドの構成](CONTRIBUTING.md#構成) を正本とします。

- `codex/config.toml` と `codex/openai-agents/` は OpenAI 用、
  `codex/go.config.toml` と `codex/go-agents/` は OpenCode Go 用の設定とする。
- `codex/AGENTS.md` は、利用者が個人用ルールへ取り込む共通ルールの正本とする。
  このリポジトリの作業規約としては扱わない。
  取り込み方は [導入ガイド](docs/installation.md#共通ルールを取り込む) を参照する。

## セットアップと検証

セットアップと検証の手順は、[開発者向けガイド](CONTRIBUTING.md#セットアップと検証) を正本とします。
PR を作成する前に、同ガイドの lint とテストをすべて実行してください。CI も同じ項目を検査します。
無関係なファイルで失敗した場合は、対象ファイルと失敗内容を報告します。

## 編集規約

- skill を変更する前に、`README.md` と対象の `SKILL.md` を読む。
  対象パスに `AGENTS.md` があれば、その指示にも従う。
- `.editorconfig` に従い、UTF-8、LF、末尾改行、2 スペースのインデントを使用する。
- `codex/config.toml` の既存キーを変更するときは値を書き換え、同じキーを重複して追加しない。
- skill のディレクトリ名には小文字の kebab-case を使用する。
  `SKILL.md`、`agents/openai.yaml`、[skill 一覧](docs/skills.md) の名称と説明を揃える。
- skill、コマンド、ワークフローを変更したら、
  [変更内容から更新対象を選ぶ](CONTRIBUTING.md#変更内容から更新対象を選ぶ) に従って関連文書も更新する。
  新しい固有名詞がスペルチェックでエラーになったら、`project-words.txt` か `cspell.json` に登録する。
- `shared-text` マーカーで囲まれた説明は、反映先を手で編集しない。
  更新元の `SKILL.md` を編集し、[共通の条件説明を更新する](CONTRIBUTING.md#共通の条件説明を更新する) の手順で同期する。
- 作業ツリーにある無関係な変更は、stage 済みのものも含めて保持する。

## コミットと PR

コミットメッセージは日本語で書きます。
`docs: リポジトリガイドを更新` や `feat(skills): skill を追加` のように書きます。
Conventional Commits 形式の type と scope は英語で記述します。
1 つのコミットには、関連する変更だけを含めます。
PR の本文は `.github/PULL_REQUEST_TEMPLATE.md` に従って記載します。
