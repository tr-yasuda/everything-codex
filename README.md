# everything-codex

このリポジトリは、`~/.codex` で使う `AGENTS.md`、`config.toml`、`skills/*` を管理するためのものです。

## 実行コマンド

```bash
bash install.sh
```

## 実行すると起きること

- `~/.codex/AGENTS.md` -> `<repo>/AGENTS.md` のリンクを作成します
- `~/.codex/config.toml` -> `<repo>/config.toml` のリンクを作成します
- `<repo>/skills/<name>` がある場合は `~/.codex/skills/<name>` のリンクを作成します
- すでに `~/.codex/AGENTS.md` や `~/.codex/config.toml`、`~/.codex/skills/<name>` がある場合は、`*.bak.<random>` という名前でバックアップが保存されます
- すでに正しいリンクがある場合は、変更しません

## 注意点

- `realpath` または `readlink -f` が使える必要があります
- 確認コマンド: `command -v realpath || command -v readlink`
- Ubuntu / Debian 系では通常 `coreutils` に含まれます
