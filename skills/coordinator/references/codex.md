# Codex CLI の補足

## 実行方法の選択

Subagent の機能名や引数はバージョンや実行方式で異なるため、現在のツール仕様を確認する。
CLI から実行状況を確認する方法として `/subagents` がある。

同時実行数の制限は `[agents]` の `max_concurrent_threads_per_session` など、現在の設定に従う。

## 確認済みの範囲

2026-11-18 に確認した公式資料では、起動、追加指示、待機、停止、終了、結果の統合が案内されている。
また、ユーザーの明示的な依頼に加え、適用される skill やプロジェクトの指示も委譲の契機になる。

Codex CLI 0.169.0 の公開実装には、子の深さを計算して上限時に起動を拒否する経路がある。
これは、すべての実行方式で同じ階層制約になることや、再委譲が必ず使えることを保証しない。
現在のツールと設定で確かめ、使える深さや機能を推測しない。

- [Subagents](https://learn.chatgpt.com/docs/agent-configuration/subagents)
- [Build skills](https://learn.chatgpt.com/docs/build-skills)
- [0.169.0 の起動処理][spawn]

[spawn]: https://github.com/openai/codex/blob/rust-v0.169.0/codex-rs/core/src/tools/handlers/multi_agents/spawn.rs
