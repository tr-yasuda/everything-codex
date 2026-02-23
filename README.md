# skills
for codex

## AGENTS.md install

このリポジトリの `AGENTS.md` を正本として、`~/.codex/AGENTS.md` をリンクします。

```bash
bash install.sh
```

リンク状態を確認:

```bash
bash scripts/verify-agents-link.sh
```

補足:
- 既存の `~/.codex/AGENTS.md` がある場合は `~/.codex/AGENTS.md.bak.<timestamp>` に退避します。
- 再実行しても、正しいリンクなら変更しません（冪等）。
