# Reviewers

各 reviewer は1つの責務に集中し、他の reviewer の観点を兼務しない。

---

## セキュリティ・認可

以下を確認する。

- 認証や認可を通らずに処理へ到達できないか
- resource 単位の authorization が抜けていないか
- tenant / organization / user の境界を越えてアクセスできないか
- caller が指定した ID だけで他者の resource を取得・更新できないか
- 権限の低い user が高い権限の操作をできないか
- 外部入力を server-side で適切に検証しているか
- injection につながる値の組み立てや実行がないか
- secret / credential を log、response、error に露出していないか
- 失敗時に安全側ではなく許可側へ倒れる処理がないか
- cryptography の利用方法に誤りがないか

---

## 正しさ・状態管理

以下を確認する。

- 処理前に必要な前提条件が満たされているか
- 処理後に維持すべき不変条件が壊れていないか
- 許可されていない状態遷移が可能になっていないか
- null / empty / missing value を正しく扱っているか
- 最小値・最大値・境界値で誤った挙動にならないか
- 削除済み・失効済み・古いデータを誤って有効として扱わないか
- 特定の処理順序を暗黙に前提としていないか
- 一部だけ成功した場合にデータが不整合な状態で残らないか
- 複数のデータ間で維持すべき整合性が壊れていないか
- error が呼び出し側に誤った意味で伝わらないか

---

## 並行処理・障害耐性

以下を確認する。

- 同時実行によって競合状態が発生しないか
- 二重送信や同時更新で処理や副作用が重複しないか
- retry しても同じ副作用が重複しないか
- 同じ操作を複数回実行しても安全か
- transaction の境界が途中状態を露出しない形になっているか
- lock の不足や範囲の誤りで競合が起きないか
- timeout 後に処理だけが継続して副作用を残さないか
- cancellation 時に中途半端な状態や resource leak が残らないか
- failure 時に connection / stream / file / task を確実に cleanup できるか
- reconnect や retry によってイベント順序が壊れないか
- queue や worker が詰まったとき、負荷が無制限に増えないか

---

## 性能・リソース

以下を確認する。

- loop 内で DB query や network request を繰り返していないか
- 同じデータ取得や通信を不要に繰り返していないか
- 必要以上のデータを取得していないか
- 大量データを pagination なしで一括処理していないか
- collection / queue / task が無制限に増えないか
- 入力サイズの増加に対して計算量が急激に悪化しないか
- memory が解放されず増え続ける経路がないか
- connection / stream / handle を解放し忘れていないか
- 高頻度で通る処理に重い処理を追加していないか
- connection pool や worker pool を枯渇させる構造になっていないか
- cache の更新・無効化によって古いデータや過剰な再計算が発生しないか

---

## 設計・保守性

以下を確認する。

- layer ごとの責務が崩れていないか
- dependency の向きが既存設計と逆転していないか
- 変更によって module 間の結合が不必要に強くなっていないか
- 1つの module や function に複数の責務を持たせていないか
- 型で表現できる制約を string / bool / sentinel value に逃がしていないか
- 不正な状態を簡単に生成できる API になっていないか
- 現在必要のない abstraction を追加していないか
- 同じ責務を複数箇所へ重複して実装していないか
- public API を必要以上に広げていないか
- repository で使われている既存パターンと不必要に乖離していないか
- 新しい dependency が本当に必要か
- comment が現在の実装や挙動と一致しているか
- 名前から想像される責務・副作用と実際の挙動が一致しているか

---

## テスト・回帰

以下を確認する。

- 今回変更された振る舞いを test が検証しているか
- 正常系だけでなく重要な error path が検証されているか
- 境界条件を test しているか
- authorization が必要な変更では拒否される経路も検証しているか
- concurrency / retry / idempotency が重要な変更では、その挙動を検証しているか
- assertion が弱すぎて誤った結果でも test が通らないか
- test setup の都合で本番では起きる問題を隠していないか
- mock が実際の dependency の挙動とかけ離れていないか
- timing や sleep に依存する不安定な test ではないか
- 削除された test や assertion が守っていた振る舞いを失っていないか
- 変更前に存在した guard / validation / error path の保証が test 上でも維持されているか
- 重要ロジックを壊した場合、失敗する test を説明できるか

---

## 運用・可観測性

以下を確認する。

- 障害原因を特定できる情報が log に残るか
- 重要な状態変化や失敗を metrics で検知できるか
- request や処理の流れを trace できるか
- 複数 service をまたぐ処理を correlation ID などで追跡できるか
- health / readiness check が実際の service 状態を正しく反映するか
- dependency 障害時に service 全体ではなく限定的に機能低下できるか
- migration が既存データや旧 version と互換性を持つか
- rollout の順序によって新旧 version が壊れないか
- rollback したときに schema や data が戻せない状態にならないか
- breaking change が利用側へ適切に伝播・管理されているか
- production incident が起きたときに検知できるか
- incident 発生後に原因と影響範囲を追跡できるか
