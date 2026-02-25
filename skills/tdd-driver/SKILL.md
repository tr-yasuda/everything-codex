---
name: tdd-driver
description: Red-Green-Refactor のテスト駆動開発を厳格に進める skill。ユーザーが「TDD」「テスト駆動」「テスト先行」「先に失敗テスト」「Red Green Refactor」「不具合再現テスト」を求めるときに使う。言語非依存でテストコマンドを検出し、`plan-only|stepwise|fast-track` モードで Test List から小さく進める。
---

# tdd-driver

## 固定ルール

- 先に失敗するテストを書き、その後に実装する。
- 失敗テストがない状態で実装を開始しない。
- 1 サイクルでは 1 つの振る舞いだけ扱う。
- Green では最小実装だけ行う。
- Green の直後に必ず Refactor を行う。
- Refactor 後に必ず同じテスト群を再実行する。
- 不具合修正では最小再現テストを先に追加する。
- 対象外の既存失敗テストがある場合は対象内外を分離して扱う。
- テスト実行コマンドは `references/command-detection.md` の自動プローブで確定する。
- 停止条件に当たった場合は、停止理由だけで終わらせず復旧手順を必ず提示する。
- DoD（Done Criteria）を満たすまで「完了」と判定しない。
- 迷った場合は変更量が小さい案を優先する。

## 実行モード

- `plan-only`: 計画だけ作成する。コード変更は行わない。
- `stepwise`: Red -> Green -> Refactor を 1 サイクルずつ進める。
- `fast-track`: 確認回数を減らして進める。ただし Red 確認と Refactor 後の再実行は省略しない。
- 指定がない場合は `plan-only` を使う。

## 参照ファイル

- TDD の判定基準は `references/tdd-rules.md` を読む。
- モードごとの入出力契約は `references/mode-contract.md` を読む。
- テストコマンド検出手順は `references/command-detection.md` を読む。
- `plan-only` 出力形式は `references/plan-output-template.md` を使う。

## 実行手順

1. 実行モードを決める。指定がなければ `plan-only` にする。
2. 対象機能と対象範囲を整理する。曖昧な場合は最小単位に分割する。
3. `references/command-detection.md` に従って候補コマンドを列挙する。
4. 各候補を自動プローブし、最初に `PASS` したコマンドを確定する。
5. 全候補が失敗した場合は 1 回だけ確認質問を行い、回答を再プローブする。
6. 再プローブでも確定できない場合は停止し、`Recovery Matrix` に復旧手順を記載する。
7. 確定したコマンドで既存テストを実行し、ベースラインを確認する。
8. 対象外の失敗がある場合は対象内外を分離し、対象内テストセットと回帰テストセットを定義する。
9. 分離できない場合は停止し、`Recovery Matrix` に分離手順を記載する。
10. `references/tdd-rules.md` の形式で Test List を作る。
11. `plan-only` の場合は `references/plan-output-template.md` の形式で計画を出力して停止する。
12. 先頭の 1 項目を選び、失敗するテストを先に作る。
13. 対象テストを実行して失敗を確認する。失敗しない場合は Red を作り直す。
14. 失敗原因を満たす最小実装だけを加える。
15. 同じ対象テストを実行して成功を確認する。
16. 必要最小限の Refactor を行う。
17. 対象テストと回帰テストを再実行する。
18. Test List に未完了があれば次の 1 項目で手順 12 に戻る。
19. `Done Criteria` を評価し、`Exit Check` を `PASS|FAIL` で出力する。
20. `FAIL` の場合は未達項目と次の 1 手を出力する。

## 停止条件と既定復旧

- 失敗テストより先に実装を求められた場合は停止し、「最小失敗テストを 1 件追加して再開」を提示する。
- テストコマンドを確定できない場合は停止し、「候補と不足情報を明記して 1 回確認後に再プローブ」を提示する。
- 既存失敗を対象内外に分離できない場合は停止し、「対象テストセットの切り出し手順」を提示する。
- 1 サイクルで複数振る舞いを同時に変更する必要がある場合は停止し、「Test List 再分割案」を提示する。

## 出力要件

- 出力は常に「現在のサイクル番号」と「次に行う 1 手」を含める。
- `plan-only` は `references/plan-output-template.md` の見出し順を維持する。
- `plan-only` は `Execution Handoff`、`Recovery Matrix`、`Done Criteria`、`Exit Check` を必ず含める。
- `stepwise` と `fast-track` は、各サイクルで Red/Green/Refactor の結果を 1 行ずつ残す。
- `stepwise` と `fast-track` の終了時に `Done Criteria` を評価し、`Exit Check` を出力する。
