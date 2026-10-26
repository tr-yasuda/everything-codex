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

Node.js 24 と、`package.json` で指定した pnpm を mise で使用します。

```bash
mise install
mise exec -- pnpm install --frozen-lockfile
mise exec -- pnpm lint:md     # Markdown の記法
mise exec -- pnpm lint:spell  # スペルと登録語
mise exec -- pnpm lint:text   # 日本語の文章
mise exec -- pnpm test:record-decision # 判断の保存処理
```
