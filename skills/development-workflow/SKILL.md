---
name: development-workflow
description: >-
  機能追加や修正を完了まで進めるときに、設計、計画、TDD、レビュー、検証を接続する。調査のみ、提案のみの依頼では実装へ進まない。
---

# Development Workflow

## 進め方

依頼の成果物、完了条件、対象外を会話と既存コードから確認する。
ユーザーの指示と対象リポジトリの規約を優先する。
言語別の規約を追加せず、既存の設定、CI、テストから作業方法を決める。

必要な工程の skill だけを読み、次の条件で進める。

- 仕様や設計に重要な選択肢がある: [designing-changes](../designing-changes/SKILL.md)。
- 不具合の原因が不明: [systematic-debugging](../systematic-debugging/SKILL.md)。
- 複数の振る舞いや依存関係がある: [planning-changes](../planning-changes/SKILL.md)。
- ファイルを変更する前: [using-git-worktrees](../using-git-worktrees/SKILL.md)。
- 振る舞いを追加・修正する: [tdd](../tdd/SKILL.md)。
- 差分が揃った: [reviewing-changes](../reviewing-changes/SKILL.md)。
- 完了を報告する: [verifying-changes](../verifying-changes/SKILL.md)。
- commit や PR を依頼された: [finishing-changes](../finishing-changes/SKILL.md)。
- レビュー指摘への対応: [responding-to-review](../responding-to-review/SKILL.md)。

小さく仕様が明確な変更は、そのまま TDD に進む。
文書や設定だけの変更は、対象に合う検証を使う。
提案だけの依頼では、判断材料と推奨案を成果物とする。

## 実行と再開

実装タスクは振る舞い単位で進める。
TDD のサイクルが閉じるまで、次の振る舞いを実装しない。
GREEN だけでタスクを完了扱いにせず、REFACTOR の点検結果も確認する。

中断時は、対象、現在の工程、実行結果、次の作業を残す。
再開時は実際の差分と記録を照合し、未完了の工程から続ける。
計画を変更する場合は、発見した事実と変更理由を記録する。
仕様や対象範囲が変わる場合だけ、必要な判断をユーザーに求める。

並列化は独立した作業に限り、実行環境と依頼の権限に従う。
この skill 自体は、エージェントの起動や外部への投稿を許可しない。
