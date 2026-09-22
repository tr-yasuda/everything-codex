# everything-codex

TDD を中心に、設計、計画、原因調査、レビュー、検証をつなぐ skills です。
公開インターフェースの振る舞いを、1 つずつテストと実装で確かめます。

## 開発フロー

```text
依頼 → 必要なら設計・計画 → TDD → レビュー → 完了検証
不具合 → 再現・仮説検証 ──→ TDD

TDD: RED → GREEN → REFACTOR 点検 → 記録 → 次の振る舞い
```

GREEN はサイクルの途中です。
各 GREEN の直後に実装とテストの設計を点検します。
改善した内容、または変更不要の具体的な理由を残してから次へ進みます。
計画、レビュー、完了検証でも、この点検記録を確認します。

変更作業は専用 worktree で行います。
小さく明確な変更は、作業場所を用意してから直接 TDD に進みます。
文書や設定だけの変更には、内容に合う lint や構文検証を使います。
言語別の practice skills は廃止し、対象リポジトリの規約を優先します。

## Skills

| Skill | 役割 |
| --- | --- |
| [development-workflow](skills/development-workflow/SKILL.md) | 依頼に必要な工程を選び、実行と再開をつなぐ |
| [designing-changes](skills/designing-changes/SKILL.md) | 期待する振る舞い、制約、設計上の選択を整理する |
| [planning-changes](skills/planning-changes/SKILL.md) | 振る舞い単位のタスクと検証方法を決める |
| [systematic-debugging](skills/systematic-debugging/SKILL.md) | 再現、観測、仮説検証で原因を調べる |
| [tdd](skills/tdd/SKILL.md) | RED、GREEN、REFACTOR のサイクルを完了する |
| [reviewing-changes](skills/reviewing-changes/SKILL.md) | 要求、差分、回帰リスク、テストを点検する |
| [verifying-changes](skills/verifying-changes/SKILL.md) | 最終差分と検証結果を照合する |
| [using-git-worktrees](skills/using-git-worktrees/SKILL.md) | 分離が必要な作業の場所を用意する |
| [finishing-changes](skills/finishing-changes/SKILL.md) | 依頼に応じて commit、push、PR を仕上げる |
| [responding-to-review](skills/responding-to-review/SKILL.md) | 指摘の妥当性を確認し、修正と再検証を進める |

既存の TDD の思想を引き継ぎ、それ以外の skills は再作成しました。
旧 practice、patterns、coding-standards、Git/PR 専用 skills の
参照を利用側で設定している場合は、上記の新しい構成へ更新してください。
using-git-worktrees は同じ名前で内容を再作成しています。

## 使い方

このリポジトリでは .agents/skills が skills/ を指すシンボリックリンクです。
定義の実体は skills/ に集約します。
Codex は .agents/skills と、その配下のシンボリックリンクを探索します。
詳細は [公式の skills ガイド][skills-docs] を参照してください。

次のように呼び出します。

```text
$development-workflow この機能を追加してください。
$tdd このバグを修正してください。
$reviewing-changes この差分をレビューしてください。
```

別のリポジトリで使う場合は、その .agents/skills/ に
この skills/ 配下の各ディレクトリをまとめて配置してください。
skills 間の相対リンクを保つため、同じ階層に配置します。
Windows などでリンクを使えない場合も、ディレクトリのコピーで配置できます。
このリポジトリの開発用 AGENTS.md を、利用先へコピーする必要はありません。

## Codex 設定

- ルートの AGENTS.md: このリポジトリの作業規約と skill の起動規則。
- .codex/config.toml: プロジェクトの実行設定。
- .codex/AGENTS.md: Codex 設定を編集する際の指針。
- .codex/agents/: 読み取り専用の explorer、reviewer、docs_researcher。

エージェント定義は name、description、developer_instructions を持つ
独立した TOML ファイルに更新しました。
モデルと推論量の固定を外し、親セッションの選択を継承します。
エージェントは、ユーザーまたは適用される指示で委任が求められた場合に使います。
詳細は [公式の subagents ガイド][agents-docs] を参照してください。

プロジェクト設定は、信頼されたプロジェクトで読み込まれます。
旧 js_repl フラグと max_depth 設定を除去し、
同時実行数は max_concurrent_threads_per_session に更新しました。
設定キーは [公式の設定リファレンス][config-docs] を参照してください。

sequential-thinking MCP の設定は削除しました。
設計や計画の進行は skills で扱います。
既存の GitHub plugin の設定は残しています。
利用には各環境での導入や接続が必要で、新しい skills の必須依存ではありません。
ユーザー設定やアカウントの接続状態は、このリポジトリでは変更しません。

## 開発と検証

Node.js 24 と pnpm@10.5.0 を使います。

```bash
pnpm install --frozen-lockfile
pnpm lint:md
pnpm lint:spell
pnpm lint:text
```

skill の変更時は、参照先と README、起動規則も合わせて更新します。
Markdown と TOML の構文検証だけでは、実際のエージェントの動作は保証できません。
REFACTOR の省略を評価する手順は
[評価シナリオ](docs/skill-evaluation.md) にまとめています。

## 参考にした設計

[Superpowers](https://github.com/obra/superpowers) の工程別 skills と、
原因調査・検証を独立させる構成を参考にしています。
このリポジトリの TDD は、従来の振る舞い中心のテストと
1 テストずつ進める方式を維持し、REFACTOR の完了条件を追加しています。

## ライセンス

MIT License です。詳細は [LICENSE](LICENSE) を参照してください。

[skills-docs]: https://learn.chatgpt.com/docs/build-skills
[agents-docs]: https://learn.chatgpt.com/docs/agent-configuration/subagents
[config-docs]: https://learn.chatgpt.com/docs/config-file/config-reference
