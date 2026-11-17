# 開発者向けガイド

このリポジトリの skill や設定を変更する人向けの情報です。
skill の導入と最初の使い方は、[README](README.md#使い始める) を参照してください。

## 構成

| パス | 内容 |
| --- | --- |
| `skills/<name>/SKILL.md` | エージェントが従う手順と制約 |
| `skills/<name>/agents/openai.yaml` | skill の表示情報と呼び出し設定 |
| `skills/<name>/references/` | skill の補足資料 |
| `skills/<name>/scripts/` | skill が使う実行用スクリプトと、そのテスト |
| `cookbooks/` | 目的別の依頼例と、確認から完了までの進め方 |
| `docs/installation.md` | Codex と Claude Code への導入・更新・読み込み確認 |
| `docs/skills.md` | 各 skill の用途・呼び出し方・変更や投稿の範囲 |
| `.codex/config.toml`、`.codex/agents/` | Codex とエージェントの設定 |
| `AGENTS.md`、`.codex/AGENTS.md` | 作業時の指示 |
| `.github/workflows/` | lint と GitHub Actions の参照先固定の検証・更新 |
| `.github/PULL_REQUEST_TEMPLATE.md` | PR の記載項目と確認事項 |

編集時は [AGENTS.md](AGENTS.md) の規約に従ってください。

## 文書の役割と更新方法

| 文書 | 役割 |
| --- | --- |
| [README](README.md) | できることと、最初の skill を試す方法 |
| [cookbook](cookbooks/README.md) | 何を頼み、返答を見てどう進め、何を確認すれば完了するか |
| [skill 一覧](docs/skills.md) | 各 skill の用途・呼び出し方・使われる条件・変更や投稿の範囲・承認が必要な操作 |
| 各 skill の `SKILL.md` | エージェントに作業手順と制約を指示する |

skill の仕様を変えるときは、`SKILL.md` を更新し、skill 一覧や関連する使用例を合わせます。
説明が食い違う場合は、`SKILL.md` を確認して説明を修正します。

README と cookbook には、紹介する使い方に必要な説明を残します。
例えば、返信の承認が必要な使用例には、承認の操作も書きます。
起動条件や変更・投稿の範囲は skill 一覧へ、詳しい作業手順は `SKILL.md` へリンクします。

### 変更内容から更新対象を選ぶ

| 変更内容 | 更新する文書 | 合わせて確認する文書 |
| --- | --- | --- |
| skill の機能・呼び出し方・起動条件・実行範囲・承認条件 | 対象の `SKILL.md` と skill 一覧 | その skill を紹介する README、関連する cookbook |
| 使い方が変わらない、作業手順の変更 | 対象の `SKILL.md` と参照資料 | その手順を読む別の skill。利用者向け文書は説明に影響する場合だけ |
| 依頼例・確認方法・完了の目安 | 対象の cookbook | cookbook 一覧のリンク |
| できることの紹介・最短の導入方法 | README | 詳細な導入手順が変わる場合は導入ガイド |
| 全体の導入・更新・読み込み確認 | [導入ガイド](docs/installation.md) | README の導入方法、skill 一覧の導入条件 |
| 文書の役割や更新方法 | この節 | 各文書の案内とリンク |

機能・呼び出し方・起動条件を変える場合は、`agents/openai.yaml` の表示情報と呼び出し設定も確認します。
skill の追加・削除・改名では、skill 一覧と関連する使用例・リンクを更新します。
`fix-ci`・`fix-pr`・`fix-conflicts` の手順を変える場合は、それを読む `babysit` の手順も確認します。

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
mise exec -- pnpm test:save-why # 判断の保存処理
mise exec -- pnpm test:shared-text # 複数の skill が同じ文で持つ定義の一致と、skill 間の参照先の存在
```
