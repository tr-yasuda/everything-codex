# everything-codex

Codex の skill、エージェント設定、GitHub Actions を管理するリポジトリです。

## 構成

- `skills/<name>/SKILL.md`: 各 skill の手順を定義する。
- `skills/<name>/agents/openai.yaml`: skill の表示情報と呼び出し設定を定義する。
- `skills/<name>/references/`: skill の補足資料を配置する。
- `.codex/config.toml`、`.codex/agents/`: Codex とエージェントの設定を管理する。
- `AGENTS.md`、`.codex/AGENTS.md`: 作業時の指示を記載する。
- `.github/workflows/`: lint と GitHub Actions の参照先固定を検証・更新する。
- `.github/PULL_REQUEST_TEMPLATE.md`: PR の記載項目と確認事項を定義する。

## Skills

| skill | 用途 |
| --- | --- |
| `code-review` | PR やローカル変更を複数の観点でレビューする。 |
| `create-pr` | 変更を commit・push し、Draft PR を作成または更新する。 |
| `define` | 実装前に要件と設計上の判断を仕様として整理する。 |
| `fix-ci` | PR で失敗した CI を調査し、修正して commit・push する。 |
| `fix-conflicts` | PR の merge conflict を解消し、検証して commit・push する。 |
| `fix-pr` | PR のレビュー指摘を検証・修正し、返信案を作る。 |
| `tdd` | 振る舞いごとに RED → GREEN → REFACTOR を進める。 |

`code-review`、`create-pr`、`define` は `$skill-name` で明示的に呼び出します。
`fix-ci`、`fix-conflicts`、`fix-pr` も同様です。
`tdd` はコードの実装・修正時に使用する設定です。
引数や実行条件は各 `SKILL.md` を参照してください。

## セットアップと検証

Node.js 24 と `pnpm@10.5.0` を使用します。

```bash
pnpm install --frozen-lockfile
pnpm lint:md
pnpm lint:spell
pnpm lint:text
```

- `pnpm lint:md`: Markdown の記法を検証する。
- `pnpm lint:spell`: スペルと登録語を検証する。
- `pnpm lint:text`: 日本語の文章を検証する。

## ライセンス

MIT License です。詳細は `LICENSE` を参照してください。
