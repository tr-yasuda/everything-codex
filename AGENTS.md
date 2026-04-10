# Repository Guidelines

## Project Structure & Module Organization

- `skills/<name>/SKILL.md` stores each reusable Codex skill.
- `skills/<name>/references/` holds optional supporting material.
- `.github/workflows/` contains CI, including `lint.yaml`.
- `.github/PULL_REQUEST_TEMPLATE.md` defines the PR checklist.
- Root config files include `package.json`, `cspell.json`,
  `.markdownlint.json`, and Textlint settings.

This repository is documentation-first. Most changes touch Markdown, skill
instructions, or repository workflow files.

## Build, Test, and Development Commands

Use Node.js 24 and `pnpm@10.5.0`.

```bash
pnpm install --frozen-lockfile
pnpm lint:md
pnpm lint:spell
pnpm lint:text
```

- `pnpm install --frozen-lockfile` installs pinned dependencies.
- `pnpm lint:md` checks Markdown structure and style.
- `pnpm lint:spell` checks spelling and project terms.
- `pnpm lint:text` checks Japanese technical writing quality.

Run all three lint commands before opening a pull request.

## Coding Style & Naming Conventions

- Follow `.editorconfig`: UTF-8, LF, final newline, 2-space indentation.
- Keep lines near the 80-character target.
- Use short headings and direct sentences in Markdown.
- Name skill directories in lowercase kebab-case, such as
  `skills/full-cycle-delivery/`.
- Update nearby docs when commands, workflow, or behavior change.

## Testing Guidelines

There is no application test suite in this repository. The main quality gates
are `pnpm lint:md`, `pnpm lint:spell`, and `pnpm lint:text`. When adding new
terms, update `project-words.txt` or `cspell.json` in the same change.

## Commit & Pull Request Guidelines

Git history uses Conventional Commits. Examples include `feat: add workflow
skills` and `feat(skills): practice skill 群と運用ガイドを追加`.

- Prefer `feat`, `fix`, `docs`, and `chore`.
- Add a scope when it helps, such as `feat(skills): ...`.
- Keep each commit focused on one logical change.

PRs should follow the template in `.github/PULL_REQUEST_TEMPLATE.md`.
Include a short summary, changed items, impact, and confirmation that all lint
checks passed. Add screenshots only when rendered output changes.

## Agent-Specific Notes

Read `README.md` and the target `skills/*/SKILL.md` before editing. Keep
changes small, repository-specific, and aligned with the existing workflow.
