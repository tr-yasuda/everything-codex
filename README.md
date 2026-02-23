# everything-codex

Codex の設定ファイル（`AGENTS.md`）を管理するリポジトリです。

## セットアップ

このリポジトリの `AGENTS.md` を正本として、`~/.codex/AGENTS.md` にシンボリックリンクを作成します。

```bash
bash install.sh
```

補足:
- 既存の `~/.codex/AGENTS.md` がある場合は `~/.codex/AGENTS.md.bak.<timestamp>` に退避します。
- 再実行しても、正しいリンクなら変更しません（冪等）。
