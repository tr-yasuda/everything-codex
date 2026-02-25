# everything-codex

このリポジトリは、`~/.codex` で使う `AGENTS.md`、`config.toml`、`skills/*`、`rules/` を管理するためのものです。

## 実行コマンド

```bash
bash install.sh
```

## 実行すると起きること

- `~/.codex/AGENTS.md` -> `<repo>/AGENTS.md` のリンクを作成します
- `~/.codex/config.toml` -> `<repo>/config.toml` のリンクを作成します
- `<repo>/skills/<name>` がある場合は `~/.codex/skills/<name>` のリンクを作成します
- `<repo>/rules` がある場合は `~/.codex/rules` のリンクを作成します
- 既定ルールは `<repo>/rules/default.rules` として管理され、`~/.codex/rules/default.rules` から参照されます
- すでに `~/.codex/AGENTS.md` や `~/.codex/config.toml`、`~/.codex/skills/<name>`、`~/.codex/rules` がある場合は、`*.bak.<timestamp>.<pid>`（必要なら `.<suffix>` 付き）という名前でバックアップが保存されます
- すでに正しいリンクがある場合は、変更しません

## 注意点

- `realpath` または `readlink -f` が使える必要があります
- 確認コマンド: `command -v realpath || command -v readlink`
- Ubuntu / Debian 系では通常 `coreutils` に含まれます
- `rules/default.rules` は `codex execpolicy` の Starlark 形式です
