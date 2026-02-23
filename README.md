# everything-codex

Codex の設定ファイル（`AGENTS.md`）を管理するリポジトリです。

## セットアップ

このリポジトリの `AGENTS.md` を正本として、`~/.codex/AGENTS.md` にシンボリックリンクを作成します。

```bash
bash install.sh
```

事前要件:
- `realpath` または `readlink -f` が利用できること（どちらも無い場合、`install.sh` はエラー終了します）。
- 事前確認コマンド:

  ```bash
  command -v realpath || command -v readlink
  ```

- Ubuntu / Debian 系では通常 `coreutils` に含まれます。

補足:
- 既存の `~/.codex/AGENTS.md` がある場合は `~/.codex/AGENTS.md.bak.<random>` に退避します。
- 再実行しても、正しいリンクなら変更しません（冪等）。
