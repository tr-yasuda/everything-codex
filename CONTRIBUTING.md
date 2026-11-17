# 開発者向けガイド

このリポジトリの skill や設定を変更する人向けの情報です。
skill の導入と最初の使い方は、[README](README.md#使い始める) を参照してください。

## 構成

| パス | 内容 |
| --- | --- |
| `skills/<name>/SKILL.md` | skill の手順 |
| `skills/<name>/agents/openai.yaml` | skill の表示情報と呼び出し設定 |
| `skills/<name>/references/` | skill の補足資料 |
| `skills/<name>/scripts/` | skill が使う実行用スクリプトと、そのテスト |
| `cookbooks/` | 目的別の依頼例と、確認から完了までの進め方 |
| `docs/installation.md` | Codex と Claude Code への導入・更新・読み込み確認 |
| `docs/skills.md` | 全 skill の用途と呼び出し方 |
| `.codex/config.toml`、`.codex/agents/` | Codex とエージェントの設定 |
| `AGENTS.md`、`.codex/AGENTS.md` | 作業時の指示 |
| `.github/workflows/` | lint と GitHub Actions の参照先固定の検証・更新 |
| `.github/PULL_REQUEST_TEMPLATE.md` | PR の記載項目と確認事項 |

編集時は [AGENTS.md](AGENTS.md) の規約に従ってください。
skill を変更するときは、[skill 一覧](docs/skills.md) と関連する cookbook の説明も揃えます。

## Codex のモデル設定

- 通常の作業と、調査・実装・レビュー用のエージェント: `gpt-6.1-sol`
- 文書調査用のエージェント: `gpt-6-luna`

## セットアップと検証

Node.js のバージョンは `mise.toml`、pnpm のバージョンは `package.json` の `packageManager` で指定します。
mise は `idiomatic_version_file_enable_tools` の設定により、この pnpm の指定を読みます。

```bash
mise install
mise run setup
mise run lint:md     # Markdown の記法
mise run lint:spell  # スペルと登録語
mise run lint:text   # 日本語の文章
mise run test:save-why # 判断の保存処理
mise run test:shared-text # 複数の skill が同じ文で持つ定義の一致と、skill 間の参照先の存在
```

実行の入口は `mise.toml` のタスクです。lint とテストのコマンド本体は `package.json` の scripts で管理します。
CI も同じ pnpm scripts を使います。

### worktree と mise の書き込み先

通常の開発では、mise の標準ディレクトリを同じユーザーの worktree 間で共有します。
ツールのバージョンは実行先の worktree の設定で選ばれるため、cache や shims の分離は不要です。
`mise run` は必要なツールを選んでタスクを実行するため、シェルの有効化も不要です。

Linux の標準構成で mise と pnpm に必要な書き込み先は、[`.codex/config.toml`](.codex/config.toml) で許可します。

| ディレクトリ | 用途 |
| --- | --- |
| `~/.cache/mise` | バージョン情報などのキャッシュとロック |
| `~/.local/share/mise` | ツール、プラグイン、ダウンロード、shims |
| `~/.local/state/mise` | 設定の信頼状態やタスクの実行状態 |
| `~/.local/share/pnpm/store` | pnpm が依存パッケージを共有するストア |

`mise install` は、ツールが導入済みでも shims を更新するため、書き込み権限が必要です。
macOS や XDG の設定などで保存先を変更した環境では、実際の保存先に合わせて許可を調整してください。
標準の保存先と変更方法は [mise のディレクトリ仕様](https://mise.jdx.dev/directories.html) を参照してください。

Codex の起動済みセッションや管理側の権限設定には、リポジトリの設定変更を反映できない場合があります。
新しいセッションで書き込み可能な範囲を確認してください。
標準ディレクトリへの書き込みが拒否された場合は、対象パスと権限設定を確認します。
過去の Memory にある `/tmp` への退避を、通常の worktree の実行方法として適用しないでください。

### 隔離が必要なテスト

mise 自体の設定やインストール状態を検証する場合は、通常の開発とは別のテスト環境を用意します。
`MISE_CACHE_DIR` と `MISE_SHIMS_DIR` だけを変えても、ツール、state、グローバル設定は共有されたままです。
cache 内のロックも分かれるため、共有する書き込み先とロックの対応を確認してください。
この 2 変数の指定だけでは、再現性・隔離性・並列実行の安全性を保証できません。

テスト対象に応じて、設定・データ・state と関連ツールの保存先、ツールのバージョンを明示します。
mise の保存先を変える環境変数は、mise を起動する前にテスト環境で設定してください。
`mise.toml` の `[env]` には置きません。保存先は、プロジェクト設定を読む前に決まるためです。
このリポジトリの通常の lint とスクリプトのテストには、この隔離は必要ありません。
