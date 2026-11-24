# 導入ガイド

このリポジトリの skill と共通の作業ルールを、Codex と Claude Code で使うための手順です。
個人用の領域に導入し、どのプロジェクトからでも利用できるようにします。

skill は `skills` CLI のコピー方式で導入します。
共通ルールは、既存の個人ルールと照合し、別途取り込みます。
モデル・権限・専用エージェントの設定は、利用者が選びます。

`codex/config.toml` と `codex/openai-agents/` は Codex 用で、skill のコピーだけでは導入されません。
`claude/agents/` は Claude Code 用で、skill のコピーだけでは導入されません。
Claude Code では、その製品の設定と利用可能なツール・subagent を使います。
このリポジトリの agent を導入した場合も、同名の agent や同じ権限があることを前提にせず、
必要な手順を実行できるか確認してください。
前提と未確認の範囲は、[Codex と Claude Code の対応状況](harness-compatibility.md) を参照してください。

## 共通の準備

Node.js 24、Git と、利用する Codex または Claude Code を用意します。
`npx` で CLI を取得するため、インターネット接続が必要です。
GitHub を操作する skill には、GitHub CLI の認証も必要です。

導入できる skill を確認します。

```bash
npx skills add tr-yasuda/everything-codex --list
```

`babysit` は、`fix-ci` の手順を読んで動きます。
`babysit` を選ぶときは、`fix-ci` も同じ製品向けに選んでください。更新するときも、2 つを一緒に更新します。

利用する製品の手順へ進んでください。両方を使う場合は、それぞれに導入します。
導入コマンドは、選択内容を確認しながら操作できる、利用者のターミナルで実行してください。

## Codex の場合

### skill を導入する

導入済みの skill を確認します。

```bash
npx skills ls -g -a codex
```

以前に `~/.codex/skills/` へ手動で導入している場合は、その内容も確認してください。
同名の skill が複数の場所に残らないよう、既存の導入先と内容を整理してから進めます。

```bash
npx skills add tr-yasuda/everything-codex -g -a codex --copy
```

導入する skill を選び、表示された配置先と上書き対象を確認してから確定します。
同名の skill を独自に編集している場合は、確定せず、差分と必要な変更を手元に残してください。
初めて導入する際は、保持したい同名の skill を選択から外します。

`-g` は全プロジェクトでの利用、`-a codex` は Codex の指定です。
`--copy` により、導入元へのリンクではなくファイルのコピーを配置します。
標準の配置先は `~/.agents/skills/<name>/` です。

### 読み込みを確認する

```bash
npx skills ls -g -a codex
```

一覧に選んだ skill と配置先があることを確認します。
Codex を起動し、`/skills` または `$` の候補に表示されることも確認してください。
起動済みの Codex に反映されない場合は、再起動します。

`define` を導入した場合は、次のように呼び出せます。

```text
$define 作りたいもの
```

### OpenCode Go の profile を使う

OpenCode Go の profile は skill の導入とは別に設定します。
この手順はリポジトリのルートで実行します。
リポジトリをまだ取得していない場合は、次のコマンドで取得して移動します。

```bash
git clone https://github.com/tr-yasuda/everything-codex.git
cd everything-codex
```

`$CODEX_HOME` に profile とモデル metadata、agent 定義を配置します。
同名ファイルがある場合は上書きせず、差分を確認して必要な変更だけを取り込んでください。

```bash
CODEX_HOME="${CODEX_HOME:-$HOME/.codex}"
mkdir -p "$CODEX_HOME/go-agents"
cp -n codex/go.config.toml "$CODEX_HOME/go.config.toml"
cp -n codex/go-models.json "$CODEX_HOME/go-models.json"
cp -n codex/go-agents/*.toml "$CODEX_HOME/go-agents/"
```

`OPENCODE_API_KEY` を環境変数に設定してから、次のコマンドで起動します。

```bash
codex --profile go --no-daemon
```

`--no-daemon` は shared background server を使わず、embedded mode で実行します。

## Claude Code の場合

### skill を導入する

導入済みの skill を確認します。

```bash
npx skills ls -g -a claude-code
```

```bash
npx skills add tr-yasuda/everything-codex -g -a claude-code --copy
```

導入する skill を選び、表示された配置先と上書き対象を確認してから確定します。
同名の skill を独自に編集している場合は、確定せず、差分と必要な変更を手元に残してください。
初めて導入する際は、保持したい同名の skill を選択から外します。

`-g` は全プロジェクトでの利用、`-a claude-code` は Claude Code の指定です。
`--copy` により、各 skill を `~/.claude/skills/<name>/` へコピーします。

### subagent を導入する

Claude Code 用の subagent 定義は、このリポジトリの `claude/agents/` にあります。
リポジトリをまだ取得していない場合は、次のコマンドで取得して移動します。

```bash
git clone https://github.com/tr-yasuda/everything-codex.git
cd everything-codex
```

全プロジェクトで使う場合は `~/.claude/agents/` へコピーします。
1 つのプロジェクトだけなら、そのプロジェクトの `.claude/agents/` へコピーします。

```bash
mkdir -p ~/.claude/agents
cp claude/agents/*.md ~/.claude/agents/
```

既存の同名ファイルがある場合は、上書き前に差分を確認し、必要な変更を手元に残してください。
`~/.claude/agents/` を新しく作った場合は、Claude Code を再起動します。

subagent と skill は、次の組み合わせで接続します。
該当する skill を導入せずに呼び出すと、期待した agent で実行されません。

| skill | 接続 |
| --- | --- |
| `research` | `docs-researcher` 上で実行する |
| `tdd` | `implementer` が事前読み込みする |

`define` で合意した仕様を実装まで進める場合は、`what-breaks`・`tdd`・`prove-it` も導入します。

`multi-scan` は元の会話で実行し、Phase 4 で独立した再確認が必要な場合は `reviewer` に個別の確認を委譲します。
`prove-it` は差分を直す役割も持つため、subagent 上ではなく元の会話で実行します。

`explorer` は調査用、`implementer` は実装用、`reviewer` はレビュー用です。
`verifier` は動作確認用として、Claude Code から直接指定できます。

### 読み込みを確認する

```bash
npx skills ls -g -a claude-code
```

一覧に選んだ skill と配置先があることを確認します。
Claude Code を起動し、`/` の候補に表示されることも確認してください。
起動済みの Claude Code に反映されない場合は、再起動します。

`define` を導入した場合は、次のように呼び出せます。

```text
/define 作りたいもの
```

## skill を更新する

更新前に、導入先で独自に編集した内容を確認し、必要な変更を手元に残します。
選んだ skill はディレクトリごと置き換わるため、独自に追加したファイルも退避してください。
使っている製品の導入コマンドを再実行し、更新する skill だけを選びます。`babysit` と `fix-ci` は、一緒に選びます。
コピー方式と製品の指定を維持するため、更新時も `--copy` と `-a` を指定します。

```bash
npx skills add tr-yasuda/everything-codex -g -a codex --copy
```

```bash
npx skills add tr-yasuda/everything-codex -g -a claude-code --copy
```

選んだ skill と同名の導入済み skill は上書きされるため、確定前に上書き対象を確認してください。
両方を使う場合は、それぞれで更新します。
Claude 用 subagent を更新するときは、`claude/agents/` から導入先へ同じ手順でコピーします。
更新後は、利用する製品の「読み込みを確認する」手順を実行します。

### 名前が変わった skill を入れ替える

次の skill は名前が変わりました。旧名の skill は、更新しても新しい名前に置き換わりません。

| 旧名 | 新しい名前 |
| --- | --- |
| `clarify-code` | `unslop` |
| `critical-thinking` | `check-twice` |
| `analyze-impact` | `what-breaks` |
| `debug-failure` | `root-cause` |
| `verify-change` | `prove-it` |
| `prevent-recurrence` | `never-again` |
| `explain-code` | `how-and-why` |
| `code-review` | `multi-scan` |

1. 導入コマンドを再実行し、新しい名前の skill を選んで導入する。
2. 旧名の skill に独自の編集があれば、必要な変更を新しい名前の skill へ移す。
3. 導入先から、旧名の skill のディレクトリを取り除く。

旧名の skill を残すと、同じ内容の skill が 2 つ読み込まれます。

### 削除した skill を導入先から取り除く

次の skill は削除されました。更新しても導入先の旧ディレクトリは残るため、内容を確認してから手動で取り除きます。

- `coordinator`
- `create-pr`
- `fix-conflicts`
- `fix-pr`
- `self-drive`

Codex では `~/.agents/skills/<name>/`、手動で導入した場合は `~/.codex/skills/<name>/` を確認します。
Claude Code では `~/.claude/skills/<name>/` を確認します。
独自に編集した内容があれば、必要な変更を残したい skill へ移してから取り除きます。

## 共通ルールを取り込む

共通ルールの正本は [`codex/AGENTS.md`](../codex/AGENTS.md) です。
このファイルの内容を、利用する製品の個人用ルールに取り込みます。

| 製品 | 個人用ルールの配置先 |
| --- | --- |
| Codex | `~/.codex/AGENTS.md` |
| Claude Code | `~/.claude/CLAUDE.md` |

Codex のホームを `CODEX_HOME` で変更している場合は、そのディレクトリの `AGENTS.md` を使います。
Claude Code の設定先を `CLAUDE_CONFIG_DIR` で変更している場合も、その配置先に合わせます。

1. 正本を開き、取り込みたいルールを確認する。
2. 個人用ルールがなければ、親ディレクトリとファイルを作り、内容をコピーする。
3. 既存の個人用ルールがあれば、差分を確認し、必要な内容を編集して取り込む。
4. 新しいセッションを開始し、ルールが読み込まれたことを確認する。

ルートの `AGENTS.md` は、このリポジトリの開発手順なので、個人用ルールにはコピーしません。
既存のルールと矛盾する箇所は、利用者が内容を選び、重複や矛盾を残さないようにします。

Codex では、読み込んだ指示の出典と要点を尋ねて確認します。
`AGENTS.override.md` がある場合は、`AGENTS.md` より優先されるため、その内容も確認してください。
Claude Code では、`/context` の Memory files に個人用ルールのパスがあることを確認します。
ルールを編集するときは、`/memory` から開けます。

ルールを更新するときも、正本と個人用ルールを比較し、必要な変更だけを取り込みます。
`skills` CLI の更新処理は、この個人用ルールを更新しません。

## 参照先

- [skills CLI の操作](https://github.com/vercel-labs/skills/blob/main/docs/commands.md)
- [skills CLI の製品別配置先](https://github.com/vercel-labs/skills/blob/main/docs/agents.md)
- [Codex の skill](https://developers.openai.com/codex/skills/)
- [Codex の個人用ルール](https://developers.openai.com/codex/guides/agents-md/)
- [Claude Code の skill](https://code.claude.com/docs/en/skills)
- [Claude Code の個人用ルール](https://code.claude.com/docs/en/memory)
