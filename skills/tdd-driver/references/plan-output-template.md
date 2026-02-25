# plan-output-template

## 使い方

- `plan-only` では必ずこの順序で出力する。
- 見出し名は変更しない。
- 各項目は具体値で埋める。

## テンプレート

```markdown
Goal
- <対象機能と完了条件>

Scope
- In: <今回の対象>
- Out: <今回やらない範囲>

Test Command
- <確定した実行コマンド>

Test List
1. [ ] <最初の小さい振る舞い>
2. [ ] <次の振る舞い>
3. [ ] <次の振る舞い>

Cycle 1 Plan
- Red: <失敗テストの追加内容>
- Green: <最小実装の方針>
- Refactor: <振る舞いを変えない改善点>

Validation
- Targeted: <対象テストの実行方法>
- Regression: <回帰確認の実行方法>

Execution Handoff
1. <実装担当が最初に実行する手順>
2. <次に実行する手順>
3. <完了判定前に実行する手順>

Recovery Matrix
- Class: <recoverable|needs-confirmation>
  Trigger: <停止条件>
  Signal: <検知方法>
  Recovery: <再開手順>
- Class: <recoverable|needs-confirmation>
  Trigger: <停止条件>
  Signal: <検知方法>
  Recovery: <再開手順>

Done Criteria
- [ ] <受け入れ条件テストが全て Green>
- [ ] <回帰確認が Green>
- [ ] <対象外失敗の扱いを明記>
- [ ] <変更内容と残課題を要約>

Exit Check
- Status: <PASS|FAIL>
- Remaining: <未達がある場合のみ記載>

Next One Step
- <今すぐ実行する 1 手>
```

## 記入ルール

- Test List は 3〜7 項目に収める。
- `Cycle 1 Plan` は 10 分以内に終わる粒度にする。
- `Execution Handoff` は順序付きで 3〜7 手にする。
- `Recovery Matrix` は想定停止条件を最低 2 件含める。
- `Exit Check` が `FAIL` の場合は `Remaining` を必須にする。
- `Next One Step` はコマンドまたはファイル操作を 1 つだけ書く。
