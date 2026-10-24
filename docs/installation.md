# 導入ガイド

このリポジトリの skill と共通の作業ルールを、Codex と Claude Code で使うための手順です。
個人用の領域に導入し、どのプロジェクトからでも利用できるようにします。

skill は `skills` CLI のコピー方式で導入します。
共通ルールは別途、既存の個人ルールと内容を確認して取り込みます。
モデル・権限・専用エージェントの設定は、利用者が選びます。

## 共通の準備

Node.js 24、Git と、利用する Codex または Claude Code を用意します。
`npx` で CLI を取得するため、インターネット接続が必要です。
GitHub を操作する skill には、GitHub CLI の認証も必要です。
`record-decision` を使う場合は、`flock` も用意します。

導入できる skill を確認します。

```bash
npx skills add tr-yasuda/everything-codex --list
```

利用する製品の手順へ進んでください。両方を使う場合は、それぞれに導入します。
導入コマンドは、選択内容を確認できるよう、利用者の対話可能なターミナルで実行してください。

## Codex の場合

### skill を導入する

導入済みの skill を確認します。

```bash
npx skills ls -g -a codex
```

以前に `~/.codex/skills/` へ手動で導入している場合は、その内容も確認してください。
同名の skill を複数の場所に配置しないよう、既存の導入先と内容を整理してから進めます。

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
使っている製品の導入コマンドを再実行し、更新する skill だけを選びます。
コピー方式と製品の指定を維持するため、更新時も `--copy` と `-a` を指定します。

```bash
npx skills add tr-yasuda/everything-codex -g -a codex --copy
```

```bash
npx skills add tr-yasuda/everything-codex -g -a claude-code --copy
```

選んだ同名の skill は上書きされるため、確定前に上書き対象を確認してください。
両方を使う場合は、それぞれで更新します。
更新後は、利用する製品の「読み込みを確認する」手順を実行します。

## 共通ルールを取り込む

共通ルールの正本は [`.codex/AGENTS.md`](../.codex/AGENTS.md) です。
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
