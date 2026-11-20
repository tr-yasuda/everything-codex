# 開発者向けガイド

このリポジトリの skill や設定を変更するためのガイドです。
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
| `docs/harness-compatibility.md` | Codex と Claude Code の対応状況・根拠・未確認範囲 |
| `codex/config.toml`、`codex/openai-agents/` | Codex とエージェントの設定 |
| `claude/agents/` | Claude Code 用の subagent 定義 |
| `AGENTS.md`、`codex/AGENTS.md` | 作業時の指示 |
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
共通管理する条件説明は、[同期の手順](#共通の条件説明を更新する)で反映します。

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

### 共通の条件説明を更新する

複数の文書で使う条件説明の一部は、`SKILL.md` を更新元として同期します。
対象と反映先は [`scripts/sync-shared-text.mjs`](scripts/sync-shared-text.mjs) の冒頭で管理します。

1. 更新元の `SKILL.md` で、`shared-text` の開始・終了マーカーに囲まれた説明を編集する。
2. `mise run sync:shared-text` で、登録された反映先の同じ範囲だけを更新する。
3. 差分を読み、前後の文章と自然につながることを確認する。
4. `mise run test:shared-text` で不一致がないことを確認する。CI でも同じ条件を検査する。

新しい説明を共通管理する場合は、更新元と反映先に同じ ID のマーカーを 1 組ずつ置き、スクリプトに登録します。
次の例のように、マーカーの間には条件や制約だけを書き、紹介文や使用例は含めません。

```markdown
<!-- shared-text:condition-id:start -->
共通管理する条件の説明。
<!-- shared-text:condition-id:end -->
```

同期処理は、登録された全範囲を確認してから書き込みます。
マーカーの欠落・重複・入れ子、空の範囲があれば、文書を書き換えずに止まります。
各 skill は単独で読めるように、同期後も説明の本文を保持します。

`test:shared-text` は、登録した説明の一致に加え、全 skill の手動・自動の起動設定を検査します。
`SKILL.md`、`agents/openai.yaml`、skill 一覧の記載が一致しなければ失敗します。
起動設定は YAML として読み取り、真偽値の `true` または `false` を検査します。
複数行や引用符付きキーでも同じ値として扱い、値が空の場合や文字列の場合は書き込み前に止まります。
`disable-model-invocation` のキーがない場合だけ、自動起動を許可する既定値を使います。
同期対象に含まれない条件説明や、紹介文・使用例の意味の整合性は、引き続き差分を読んで確認します。

## Codex のモデル設定

- メインモデル: `gpt-6.1-sol`
- 明示していない subagent の既定モデルと `/review`: `gpt-6.2-sol`
- `explorer`・`implementer`: `gpt-6.1-terra`
- `docs-researcher`: `gpt-6-luna`
- `docs-researcher` の推論量は `high` に固定する

CLI の全画面表示では、回答を追いやすくするため、完了した処理の詳細を折り畳みます。
`tui.collapse_turn_details = true` で設定します。

通常の作業、Plan、subagent の既定の推論量は `medium` です。
subagent を起動するときは、役割を目安に依頼の難しさで推論量を次の 3 段階から選び、
`reasoning_effort` に明示します。

| 推論量 | 任せる作業 |
| --- | --- |
| `low` | 範囲が明確な検索・抜粋・一覧化 |
| `medium` | 通常の調査・実装。判断に迷う場合もこの値 |
| `high` | 複雑な原因分析・実装・レビュー |

起動時の指定を省略した場合は、既定値の `medium` を使います。
`docs-researcher` 以外の専用エージェントには `model_reasoning_effort` を固定しません。
固定すると起動時の指定より優先されるためです。
`docs-researcher` は一次資料の確認と適用条件の整理を重視するため、`high` に固定します。
優先順位の詳細は、[Codex の subagent 設定](https://learn.chatgpt.com/docs/agent-configuration/subagents#custom-agents) を参照してください。

OpenCode Go 用の `go.config.toml` では、モデル別の推論量規約を使います。
`glm-5.3` と `deepseek-v4.1-flash` は `low`、`high`、`max` を受け付けます。
通常の難易度には `high`、最も難しい調査・実装・レビューには `max` を使います。
Go 用の agent にはこの 2 モデルだけを使い、subagent の既定の推論量を `high` にします。
文書調査用の agent は `high` に固定します。

`go.config.toml` はモデル metadata を `go-models.json` から読み込みます。
`--profile` は embedded mode で動きます。
shared background server を使わない場合は、起動時に `--no-daemon` を指定します。

OpenAI 用の選択基準は [`codex/config.toml`](codex/config.toml) の `developer_instructions` に定義します。
OpenCode Go 用の選択基準は [`codex/go.config.toml`](codex/go.config.toml) に定義します。
専用エージェントの指示は共通指示を置き換えるため、依頼文にも利用するプロファイルの選択基準を記載し、
再委譲する場合も同じ規約を引き継ぐよう指示します。

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
mise run test:claude-agents # Claude 用 subagent と skill の接続
mise run test:self-drive # self-drive の並列・再開・Draft PR 契約
mise run test:shared-text # 共通の条件説明・定義、起動設定、skill 間の参照先
```

実行の入口は `mise.toml` のタスクです。lint とテストのコマンド本体は `package.json` の scripts で管理します。
CI も同じ pnpm scripts を使います。

### worktree と mise の書き込み先

通常の開発では、同じユーザーの worktree 間で mise の標準ディレクトリを共有します。
ツールのバージョンは実行先の worktree の設定で選ばれるため、cache や shims の分離は不要です。
`mise run` は必要なツールを選んでタスクを実行するため、シェルの有効化も不要です。

Linux の標準構成で mise と pnpm に必要な書き込み先は、[`codex/config.toml`](codex/config.toml) で許可します。

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
