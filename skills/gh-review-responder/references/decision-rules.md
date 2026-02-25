# decision-rules

## 目的

- レビューコメントを `action_required|no_action|needs_clarification` の 3 値で一貫して判定する。

## 判定手順

1. コメントが「仕様違反・バグ・安全性・性能・テスト不足」を指摘しているか確認する。
2. 指摘が事実で、修正で価値が上がるなら `action_required` にする。
3. 指摘が既対応、誤解、または任意提案で現状維持が妥当なら `no_action` にする。
4. 情報不足、要求衝突、意図不明があるなら `needs_clarification` にする。
5. 迷った場合は `needs_clarification` を優先する。

## `action_required` の目安

- 再現可能な不具合の指摘がある。
- 境界値、例外処理、`null` など安全面の欠落がある。
- 合意済み仕様との差分がある。
- CI 失敗やテスト欠落など品質リスクが明確である。

## `no_action` の目安

- 既存コードで同等の担保が取れている。
- 変更すると逆に仕様逸脱や後方互換性リスクが増える。
- 提案は任意で、現PRのスコープ外である。

## `needs_clarification` の目安

- どの仕様を優先するか不明である。
- レビュアー間で要求が競合している。
- 追加データや再現条件がないと判断できない。

## 判定メモの最小形式

- `decision`: `action_required|no_action|needs_clarification`
- `reason`: 1 文
- `next_action`: `fix|reply-and-resolve|ask-question`

## `next_action` とワークフローの対応

- `decision: action_required` のときは `next_action: fix` とする。`SKILL.md` の修正ステップに進み、`reply-templates.md` の `action_required` を使う。
- `decision: no_action` のときは `next_action: reply-and-resolve` とする。コード修正は行わず、`reply-templates.md` の `no_action` で返信し、thread を resolve する。
- `decision: needs_clarification` のときは `next_action: ask-question` とする。追加確認を返信し、`reply-templates.md` の `needs_clarification` を使う。
- `next_action` は `decision` から機械的に決まる補助ラベルとする。独立に別判断しない。
