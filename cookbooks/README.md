# Cookbook

skill を導入済みの人向けに、よくある依頼と、その進め方をまとめています。
やりたいことに近い行を選び、最初のプロンプトから始めてください。
リンク先には、返答を見て次に何を頼むか、どこまでできれば完了かも載せています。

## やりたいことから選ぶ

| やりたいこと | 自分が送る依頼の流れ | 最初のプロンプト例 |
| --- | --- | --- |
| [小さいバグ修正][bugs] | 修正を依頼 | この不具合を直して。既存仕様は変えないで |
| [原因不明の不具合][bugs] | 原因調査と修正を依頼 | このエラーの原因を特定して直して |
| [新機能の追加][feature] | `$define` → 合意して実装を依頼 | `$define` この機能の欲しい状態を整理して |
| [大きめの仕様追加][large] | `$define → $write-spec → $design-interface` → 合意 | `$define` まず仕様を固めたい |
| [技術の採用判断][research] | 調査を依頼 → 採用判断 → 必要なら記録を依頼 | X を採用すべきか公式情報を調べて判断材料を出して |
| [変更を PR にする][pr] | `$multi-scan` → 必要な修正を依頼 → `$create-pr` | `$multi-scan` この変更をレビューして |
| [PR のレビュー対応][maintain] | `$fix-pr` → 返信案を確認・承認 | `$fix-pr pr#123` |
| [指摘した PR の再確認][recheck] | `$recheck-pr` → 返信案を確認・承認 | `$recheck-pr pr#123` |
| [CI の失敗を直す][maintain] | `$fix-ci` | `$fix-ci pr#123` |
| [競合を解消する][maintain] | `$fix-conflicts` | `$fix-conflicts pr#123` |
| [コードを理解・整理][code] | `$how-and-why` → 必要なら `$unslop` | `$how-and-why` この差分の流れと理由を説明して |
| [文章を読み手向けに直す][text] | `$make-it-clear` → 必要なら反映を依頼 | `$make-it-clear pr#123` |
| [同じ指摘の再発を防ぐ][prevention] | `$never-again` → 防ぎ方に合意 | `$never-again` このミスを仕組みで防いで |
| [実装と文書を揃える][docs] | 文書の更新を依頼 | 今回の変更で古くなった説明や使用例を揃えて |
| [状況と判断事項を知る][status] | 状況の説明を依頼 | 今の状況と、私が判断する必要のあることを説明して |
| [依存関係を更新][deps] | `$update-deps` | `$update-deps` typescript を最新の安定版へ更新して |

[bugs]: fix-bug.md
[feature]: new-feature.md
[large]: large-feature.md
[research]: choose-technology.md
[pr]: review-and-pr.md
[maintain]: maintain-pr.md
[recheck]: recheck-pr.md
[code]: understand-code.md
[text]: rewrite-for-reader.md
[prevention]: prevent-recurrence.md
[docs]: sync-docs.md
[status]: catch-up.md
[deps]: update-deps.md

## プロンプトの使い方

対象のプロジェクトをエージェントで開き、依頼文を会話欄へ送ります。
ターミナルで実行するコマンドではありません。
機能、ライブラリ名、ファイルのパス、PR 番号は、自分の対象に置き換えてください。
各レシピの題材や、途中で返る提案・指摘は、使い方を示す例です。

表の `$define` などは、手動で呼ぶ skill です。続く文章と一緒に送ってください。
Codex の表記で載せているため、Claude Code では `/define` のように先頭を置き換えます。

通常の実装や修正は、自然な言葉で頼めます。

## 自動で使われる skill

次の skill は、依頼に応じてエージェントが使います。毎回、自分で呼ぶ必要はありません。
例えば「実装と検証をお願い」と頼めば、次の 3 つが使われます。
書き換える前の影響調査には `what-breaks`、コード変更には `tdd`、完了前の確認には `prove-it` です。

| 場面 | 自動で使われる skill |
| --- | --- |
| 既存コードを書き換える前の影響調査 | `what-breaks` |
| コードの実装・修正 | `tdd` |
| 不具合や想定外の失敗の原因調査 | `root-cause` |
| 変更後の完了報告前の、差分の点検と検証 | `prove-it` |
| 外部情報の調査や事実確認 | `research` |
| 採用方針など、判断の前提を確かめる | `check-twice` |
| 状況や判断事項の説明を頼んだとき | `catch-up` |
| 判断の保存・訂正・撤回や、過去の判断の参照を頼んだとき | `save-why` |

自動の skill も、名前を指定して呼べます。
`save-why` による保存には、判断を記録するよう明示的に頼む必要があります。

## 依頼の流れの読み方

最初の表の矢印は、自分が依頼を送ったり、提案へ返答したりする順序です。
次の手動 skill へ進むときは、同じ会話で自分から呼び出します。
すでに仕様が決まっていれば実装から、変更があるならレビューから始められます。

`define` は相談と短い仕様の合意までです。
`design-interface` は、公開 API やデータの形式など、リポジトリの外から依存される契約の合意後、実装まで進みます。
内部の型・関数名・モジュール構成はエージェントが決め、すでに合意した内容にもう一度合意を求めません。
`write-spec` は、相談して合意した内容を、一部分ずつ仕様書へ書きます。
例えば新機能の追加では、`define` の相談で仕様に合意してから、実装を頼みます。
その後の `what-breaks`、`tdd`、`prove-it` は自動で使われるので、追加の呼び出しは不要です。

指摘がなければ修正を、説明で理解できれば `unslop` を省けます。
`fix-pr` などは検証まで含むため、検証用の skill を別に呼ぶ必要はありません。
検証済みの項目を、手順をなぞるためだけに繰り返す必要もありません。

## 変更・共有・記録の範囲

`create-pr` は commit・push と Draft PR の作成または更新まで進みます。
open の PR がないブランチでは、ブランチ名を変更内容を表す名前へ、確認なしで変えます。
`fix-pr`、`fix-ci`、`fix-conflicts` も、対象 PR への修正を commit・push します。
`fix-pr` の返信は、ユーザーが文面を承認してから送信されます。
`recheck-pr` は、自分が立てたスレッドの resolve と PR の approve を確認なしで行います。
コードは変更せず、返信はユーザーが文面を承認してから送信されます。
GitHub を使う例は、対象リポジトリへの認証と必要な権限がある前提です。
`make-it-clear` が編集するのは、Git で元の内容を戻せるファイルだけです。
PR description や投稿済みのコメントは、書き直した文章を示すだけで、更新しません。

それ以外の実装・修正の依頼例は、commit・push を含めていません。
`save-why` で判断を保存するのは、保存を明示的に頼んだときだけです。
本人用の記録はリポジトリ外に置かれ、PR や共有文書には追加されません。

skill ごとの詳しい仕様は、[skill 一覧](../docs/skills.md) から確認できます。
