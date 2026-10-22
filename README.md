# everything-codex

Codex と Claude Code で使う skill、Codex のエージェント設定、GitHub Actions を管理するリポジトリです。

## 構成

- `skills/<name>/SKILL.md`: 各 skill の手順を定義する。
- `skills/<name>/agents/openai.yaml`: skill の表示情報と呼び出し設定を定義する。
- `skills/<name>/references/`: skill の補足資料を配置する。
- `.codex/config.toml`、`.codex/agents/`: Codex とエージェントの設定を管理する。
- `AGENTS.md`、`.codex/AGENTS.md`: 作業時の指示を記載する。
- `.github/workflows/`: lint と GitHub Actions の参照先固定を検証・更新する。
- `.github/PULL_REQUEST_TEMPLATE.md`: PR の記載項目と確認事項を定義する。

## Codex のモデル設定

- 通常の作業と調査・実装・レビュー用のエージェントには `gpt-6.1-sol` を使用する。
- 文書調査用のエージェントには `gpt-6-luna` を使用する。

## Skills

| skill | 用途 |
| --- | --- |
| `catch-up` | 何が変わり、何を判断すべきかを、判断材料つきで腹落ちする形で伝える。 |
| `clarify-code` | 対象差分の処理と関連コメントを精査し、振る舞いを保って追いやすくする。 |
| `code-review` | PR やローカル変更を複数の観点でレビューする。 |
| `create-pr` | 変更を commit・push し、Draft PR を作成または更新する。 |
| `debug-failure` | 問題を見つけたら、原因を特定してから根本原因を直す。 |
| `define` | 実装前に困りごとを確かめ、本当に欲しいものを短い仕様にまとめる。 |
| `design-interface` | 使い方・型・名前・モジュールの分け方を合意してから実装する。 |
| `explain-code` | コードがどう動き、なぜその形なのかを結論から順に説明する。 |
| `fix-ci` | PR で失敗した CI を調査し、修正して commit・push する。 |
| `fix-conflicts` | PR の merge conflict を解消し、検証して commit・push する。 |
| `fix-pr` | PR のレビュー指摘を検証・修正し、返信案を作る。 |
| `prevent-recurrence` | 繰り返す指摘を、構造・型・lint・テストで起こせなくする。 |
| `tdd` | 振る舞いごとに RED → GREEN → REFACTOR を進める。 |
| `update-deps` | 指定した依存関係を最新の安定版へ更新し、検証する。 |
| `verify-change` | 完了を報告する前に、変更を実際に動かして確かめる。 |
| `write-spec` | 全体像から 1 section ずつ合意し、理解して説明できる仕様書を作成・更新する。 |

`clarify-code`、`code-review`、`create-pr`、`define` は手動で呼び出します。
`design-interface`、`explain-code`、`fix-ci`、`fix-conflicts`、`fix-pr` も同様です。
`prevent-recurrence`、`update-deps`、`write-spec` も手動で呼び出します。
Codex では `$skill-name`、Claude Code では `/skill-name` を使います。
`tdd`、`verify-change`、`debug-failure`、`catch-up` は、該当する場面で自動的に使われる設定です。
`tdd` はコードの実装・修正時、`verify-change` は完了を報告する前に使われます。
`debug-failure` は、テストの失敗や想定外の動きを見つけたときに使われます。
`catch-up` は、合意を変える必要のある問題を実装中に見つけたときと、状況の説明を求められたときに使われます。
自動で使われる skill も、手動で呼び出せます。
各 skill は単体で動き、他の skill を呼び出しません。
引数や実行条件は各 `SKILL.md` を参照してください。

## セットアップと検証

Node.js 24 と、`package.json` で指定した pnpm を mise で使用します。

```bash
mise install
mise exec -- pnpm install --frozen-lockfile
mise exec -- pnpm lint:md
mise exec -- pnpm lint:spell
mise exec -- pnpm lint:text
```

- `pnpm lint:md`: Markdown の記法を検証する。
- `pnpm lint:spell`: スペルと登録語を検証する。
- `pnpm lint:text`: 日本語の文章を検証する。

## ライセンス

MIT License です。詳細は `LICENSE` を参照してください。
