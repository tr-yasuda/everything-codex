# Repository Guidelines

## Project Structure & Module Organization
- `.codex/AGENTS.md`: runtime agent policy synced to `~/.codex/AGENTS.md`.
- `config.toml`: default Codex runtime configuration for model, approvals, and features.
- `skills/<skill-name>/`: installable skills. Keep each skill self-contained with `SKILL.md`, and optional `agents/`, `references/`, `assets/`, or `scripts/`.
- `rules/default.rules`: default execution policy used by Codex.
- `install.sh`: links repository-managed files into `~/.codex` and preserves prior files as backups.
- `.github/pull_request_template.md`: required pull request structure.

## Build, Test, and Development Commands
- `bash install.sh`: creates or refreshes symlinks for AGENTS, config, skills, and rules.
- `command -v realpath || command -v readlink`: verifies required path-resolution tooling.
- `git status -sb`: quick check of working tree changes before and after edits.
- `rg "pattern"`: preferred text search in this repository.
- `fdfind <name>`: preferred file search on Ubuntu when `fd` is unavailable.

## Coding Style & Naming Conventions
- Shell scripts should use `bash` with `set -euo pipefail`.
- Quote variable expansions and prefer small, single-purpose functions.
- Keep docs concise, command-first, and specific to repository workflows.
- Name skill directories in kebab-case (example: `gh-review-responder`).
- Preserve existing paths and file names; each skill root must include `SKILL.md`.

## Testing Guidelines
- There is no formal automated test suite yet.
- Validate behavior by running `bash install.sh` and checking:
  - symlinks point to repository files,
  - existing targets are backed up as `*.bak.<timestamp>.<pid>`.
- For `install.sh` changes, test both first-run setup and re-run idempotency.

## Commit & Pull Request Guidelines
- Follow Conventional Commits seen in history: `feat(scope): ...`, `fix(scope): ...`, `docs(...): ...`, `chore(...): ...`.
- Keep each commit focused on one intent.
- Complete all PR template sections: Summary, Changes, Testing, Commit Intent Map, and Split Exception.
- In the Testing section, include exact commands and outcomes (for example, `bash install.sh` and result).

## Security & Configuration Notes
- Do not commit secrets or user-specific paths from `~/.codex`.
- Review `config.toml` changes carefully because they affect global Codex behavior.
