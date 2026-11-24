# Codex と Claude Code の対応状況

同じ skill でも、利用できるツール・subagent・権限によって実行方法は変わります。
必要な作業ごとに、完了・代替・実行できずに残った範囲を確認してください。
設定値や agent 名の一致は、対応の判定には使いません。

## 確認範囲

2026-11-18 に、`6ab7a83` 時点の全 23 skill の手順・参照資料・起動設定と、導入ガイド・Codex 用設定を確認しました。
その後に追加された `coordinator` は、今回の調査に含みません。
以下は、手順と公式仕様を照合した結果です。両ハーネスで全 skill の動作が一致することを保証するものではありません。

- 手順上の不足を確認: `multi-scan` の、同時起動数の不足と subagent の起動失敗・結果未取得時の扱い。
  当時の 7 観点を保つ担当割当・順次起動の手順と、代替点検・必要な独立した再確認の未完了報告を追加しました。
- 説明の不一致を確認: `prove-it` には独立検証ができない場合の扱いがありますが、
  新機能追加の cookbook は独立検証を常に行う説明でした。未実施の場合の説明を補いました。
- それ以外: 下表の観点では、手順上の不足は見つからなかった。実環境での動作は未確認。

## 設定と起動の違い

| 対象 | Codex | Claude Code |
| --- | --- | --- |
| 手動起動 | `$skill-name` | `/skill-name` |
| 自動起動の制御 | `agents/openai.yaml` の `allow_implicit_invocation` | YAML の `disable-model-invocation` |
| モデル・実行権限 | Codex の設定とセッションに適用される制約 | Claude Code の設定とセッションに適用される制約 |
| 専用 agent | `codex/openai-agents/` などの定義 | `.claude/agents/` などの定義 |

全 23 skill で、手動・自動の起動指定は両方の記述が一致しています。
これは設定の照合結果で、実際の自動選択や読み込みを実行確認した結果ではありません。
起動制御の根拠は [Codex の skill 設定][codex-skills] と [Claude Code の skill 設定][claude-skills] です。

このリポジトリの `codex/config.toml` と `codex/openai-agents/` は、skill の導入だけではコピーされません。
`claude/agents/` も、skill の導入だけではコピーされません。
Claude Code は [JSON の設定ファイル][claude-settings] と、[独自の subagent 定義][claude-agents] を使います。
このリポジトリの定義を導入した場合は、次の agent を利用できます。
`docs-researcher`・`explorer`・`implementer`・`reviewer`・`verifier`。
導入していない環境では、これらを前提にしません。

Claude Code では、skill の `context: fork` と `agent` で独立した subagent 上で skill を実行できます。
subagent の `skills` は、agent の起動時に skill 内容を読み込みます。
このリポジトリでは、`research` を skill から agent へ接続します。
`tdd` を `implementer` に事前読み込みします。同じ skill を両方向に接続すると内容が二重になるため避けます。
`multi-scan` は元の会話で実行し、Phase 4 で独立した再確認が必要な場合は `reviewer` に個別の確認を委譲します。

Codex の [subagent 設定][codex-agents] にも、有効・無効、同時起動数、モデルなどの条件があります。
モデルや推論量が違うことだけでは問題と判定せず、必要な作業と制約を満たせるかを確かめます。
agent の名前や設定にある `sandbox_mode` だけで、実際に読み取り専用であるとは判断しません。
利用中のバージョンとセッションで有効な権限・ツールを確認し、担当にも禁止する操作を伝えます。
Claude Code でも [ツールの許可と承認][claude-permissions] を別に確認します。

## skill ごとの前提と、実行できない場合の扱い

下表は両ハーネスに共通する手順の確認結果です。リンク先の `SKILL.md` を正本とします。
すべての行について、両ハーネスでの一連の実動作は未確認です。

| skill | 確認した前提と扱い |
| --- | --- |
| [align] | 特定の agent・モデルを要求しない。エージェントとユーザーの認識合わせまで行う。合意後の実装は what-breaks → tdd → prove-it に引き継ぎ、各 skill の前提に従う |
| [design-interface] | 特定の agent を要求しない。未合意の契約に関わる実装は始めない |
| [write-spec] | 特定の agent を要求しない。合意前は仕様を保存しない |
| [catch-up] | 特定の agent を要求しない。観察できた状態と判断待ちを伝える |
| [check-twice] | 原文・コード・合意を確認し、確かめきれない前提を断定しない |
| [make-it-clear] | 検出・点検の分担は任意。起動不可・結果未取得の範囲は自分で点検する |
| [research] | 検索や資料へのアクセスが必要。原典に届かなければ資料と結論の限界を示す |
| [what-breaks] | 読み取り専用の subagent は任意。起動不可・結果未取得の範囲は親が調べる |
| [root-cause] | 並列調査は任意。使えなければ親が調べ、未確定・結果未取得の仮説も確認する |
| [tdd] | 調査・検証の委譲は任意。同じ変更の実装サイクルは 1 担当が直列に進める |
| [unslop] | 変更・検証用のツールが必要。振る舞いを保てる根拠がなければ推測で書き換えない |
| [update-deps] | 更新と検証に使うツールが必要。目標に届かなければ残った制約と理由を報告する |
| [never-again] | 履歴・レビュー・検査手段が必要。確認した繰り返しだけを対象にして防ぎ方を合意する |
| [prove-it] | reviewer が使えなければ親が点検する。verifier の代替は独立検証に数えない |
| [multi-scan] | 8 観点を確認し、リスクから再確認の要否を判断する。必要な独立した再確認ができなければ一部未完了とする |
| [create-pr] | GitHub 操作と検証が必要。環境で検証できない範囲を明記し、チェック欄は空にする |
| [fix-ci] | GitHub のログ取得・修正・検証・push が必要。外部環境が原因なら原因を報告する |
| [fix-conflicts] | Git の取得・merge・検証・push が必要。検証不可なら代替検証を行う |
| [fix-pr] | GitHub の取得・修正・検証・push が必要。返信は文面の承認後に送信する |
| [recheck-pr] | GitHub の取得・操作が必要。確認や操作が失敗した場合は resolve・approve しない |
| [babysit] | 指定の 3 skill を相対パスで読む。読めなければ始めず、取得・操作の失敗でも止まる |

subagent の代替は、元の手順が許す範囲で行います。
親による点検・検証は、別の担当による独立した確認には数えません。
ネットワークや実行権限が不足しても、必要な調査・検証を黙って省略したり、完了扱いにしたりしません。

## 実行確認と未確認の範囲

- Codex CLI: `0.169.0` のバージョン表示のみ確認。
  skill の読み込み、agent ごとの実効権限、全手順の実行は未確認。
- ローカルの Claude Code: 起動に必要なコマンドを見つけられず、バージョン表示の段階で失敗。
  この環境での skill の読み込み・自動起動・subagent の実行は未確認。
- GitHub への投稿・push、本人用の記録の読み書き: この比較のための実行は未実施。
  それらを含む一連の処理は未確認。

`multi-scan` は、subagent の起動を禁止した想定条件で評価しました。
別々の評価担当が、2 種類のテスト用の差分をレビューしました。
軽微な見出しの修正では、当時の 7 観点を自分で確認し、独立した再確認を省略して完了と報告しました。
認可条件の変更では、問題を検出し、必要な独立した再確認を実施できないため一部未完了と報告しました。
これは機能制限を与えた評価で、両ハーネスでの起動失敗や、同時起動数の制限を再現した結果ではありません。

利用する環境では、[導入ガイド](installation.md) の読み込み確認に加えて、次の条件を確認してください。
検証には一時的なリポジトリとテスト用データを使い、外部への書き込みや権限変更は別途許可された範囲で行います。

| 条件 | 確認する振る舞い |
| --- | --- |
| 必要な subagent を使える | リスクに応じて担当を割り当て、8 観点と必要な独立した再確認を終える |
| 同時に 1 担当しか起動できない | 担当を調整するか順番に起動し、8 観点と必要な再確認の独立性を保つ |
| subagent を使えない・結果が返らない | 親が確認する。必要な独立した再確認ができなければ一部未完了と報告する |
| 必要なファイルや資料を読めない | 確認できなかった範囲と理由を示し、指摘なしと確認完了を区別する |
| 検証コマンドやネットワークを使えない | 各 skill の代替・停止条件に従い、未検証の範囲を報告する |

新しい確認結果を追加するときは、ハーネスとバージョン、利用可能な機能と権限、
依頼と期待する結果、実際に観察した結果を記載します。
想定条件での手順の点検を、実ハーネスでの動作確認として扱わないでください。

[codex-skills]: https://learn.chatgpt.com/docs/build-skills#optional-metadata
[codex-agents]: https://learn.chatgpt.com/docs/agent-configuration/subagents
[claude-skills]: https://code.claude.com/docs/en/skills#control-who-invokes-a-skill
[claude-settings]: https://code.claude.com/docs/en/settings
[claude-agents]: https://code.claude.com/docs/en/sub-agents
[claude-permissions]: https://code.claude.com/docs/en/permissions
[align]: ../skills/align/SKILL.md
[design-interface]: ../skills/design-interface/SKILL.md
[write-spec]: ../skills/write-spec/SKILL.md
[catch-up]: ../skills/catch-up/SKILL.md
[check-twice]: ../skills/check-twice/SKILL.md
[make-it-clear]: ../skills/make-it-clear/SKILL.md
[research]: ../skills/research/SKILL.md
[what-breaks]: ../skills/what-breaks/SKILL.md
[root-cause]: ../skills/root-cause/SKILL.md
[tdd]: ../skills/tdd/SKILL.md
[unslop]: ../skills/unslop/SKILL.md
[update-deps]: ../skills/update-deps/SKILL.md
[never-again]: ../skills/never-again/SKILL.md
[prove-it]: ../skills/prove-it/SKILL.md
[multi-scan]: ../skills/multi-scan/SKILL.md
[create-pr]: ../skills/create-pr/SKILL.md
[fix-ci]: ../skills/fix-ci/SKILL.md
[fix-conflicts]: ../skills/fix-conflicts/SKILL.md
[fix-pr]: ../skills/fix-pr/SKILL.md
[recheck-pr]: ../skills/recheck-pr/SKILL.md
[babysit]: ../skills/babysit/SKILL.md
