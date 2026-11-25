# Cookbook

skill を導入済みの人向けに、よくある依頼と、その進め方をまとめています。
やりたいことに近い行を選び、最初のプロンプトから始めてください。
リンク先には、返答を見て次に何を頼むか、どこまでできれば完了かも載せています。
各 skill が何を変更・投稿し、どの操作に承認が必要かは、[skill 一覧](../docs/skills.md) で確認できます。

## やりたいことから選ぶ

| やりたいこと | 自分が送る依頼の流れ | 最初のプロンプト例 |
| --- | --- | --- |
| [小さいバグ修正][bugs] | 修正を依頼 | この不具合を直して。既存仕様は変えないで |
| [原因不明の不具合][bugs] | 原因調査と修正を依頼 | このエラーの原因を特定して直して |
| [新機能の追加][feature] | `$align` → 認識を合わせて実装を依頼 | `$align` この機能の困りごととゴールを確認して |
| [大きめの仕様追加][large] | `$align → $write-spec` → 合意して実装を依頼 | `$align` まず認識を合わせたい |
| [技術の採用判断][research] | 調査を依頼 → 採用判断 | X を採用すべきか公式情報を調べて判断材料を出して |
| [変更を PR にして、マージまで任せる][pr] | `$multi-scan` → 判断が必要な事項に回答 → `$babysit` | `$multi-scan` この変更をレビューして。直せるものは直して |
| [CI の失敗を直す][maintain] | `$fix-ci` | `$fix-ci pr#123` |
| [PR の対応をまとめて任せる][babysit] | `$babysit` → 報告を確認、返信案を承認 | `$babysit pr#123` |
| [文章を読み手向けに直す][text] | `$make-it-clear` → 必要なら反映を依頼 | `$make-it-clear pr#123` |
| [CLAUDE.md・AGENTS.md を改善する][instructions] | `$refine-instructions` → 差分を確認して PR へ | `$refine-instructions` |
| [実装と文書を揃える][docs] | 文書の更新を依頼 | 今回の変更で古くなった説明や使用例を揃えて |
| [状況と判断事項を知る][status] | 状況の説明を依頼 | 今の状況と、私が判断する必要のあることを説明して |
| [依存関係を更新][deps] | `$update-deps` | `$update-deps` typescript を最新の安定版へ更新して |

[bugs]: fix-bug.md
[feature]: new-feature.md
[large]: large-feature.md
[research]: choose-technology.md
[pr]: review-and-pr.md
[maintain]: maintain-pr.md
[babysit]: maintain-pr.md#まとめて任せたい
[text]: rewrite-for-reader.md
[instructions]: refine-instructions.md
[docs]: sync-docs.md
[status]: catch-up.md
[deps]: update-deps.md

## プロンプトの使い方

対象のプロジェクトをエージェントで開き、依頼文を会話欄へ送ります。
ターミナルで実行するコマンドではありません。
機能、ライブラリ名、ファイルのパス、PR 番号は、自分の対象に置き換えてください。
各レシピの題材や、途中で返る提案・指摘は、使い方を示す例です。

表の `$align` などは、手動で呼ぶ skill です。続く文章と一緒に送ってください。
Codex の表記で載せているため、Claude Code では `/align` のように先頭を置き換えます。

通常の実装や修正は、自然な言葉で頼めます。

## 依頼の流れの読み方

表の矢印は、依頼や提案への返答を送る順序です。
次の手動 skill へ進むときは、同じ会話で自分から呼び出します。
すでに仕様が決まっていれば実装から、変更があるならレビューから始められます。

各レシピの「自動で使われる skill」は、追加で呼び出す必要はありません。

指摘がなければ修正を、説明で理解できれば `unslop` を省けます。
`babysit` は検証まで含むため、検証用の skill を別に呼ぶ必要はありません。
検証済みの項目を、手順をなぞるためだけに繰り返す必要もありません。

## 実行前に確認すること

GitHub を使う例は、対象リポジトリへの認証と必要な権限がある前提です。
各レシピにある、変更・投稿の範囲と承認が必要な操作を確認してから依頼してください。
