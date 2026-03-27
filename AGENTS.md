# Repository Guidelines

## Project Structure & Module Organization

This repository is a documentation- and skill-centric workspace. Keep
top-level config files at the root. Examples include `package.json`,
`cspell.json`, the markdownlint config, and the Textlint config. Store reusable
skill definitions under `skills/<skill-name>/SKILL.md`. Put skill-specific
agent metadata in `skills/<skill-name>/agents/openai.yaml`. Use
`.github/workflows/` for CI automation. Use
`.github/PULL_REQUEST_TEMPLATE.md` for review-ready pull requests. Reserve
`templates/` and `rules/` for shared authoring assets and repository-wide
guidance.

## Build, Test, and Development Commands

Use Node.js 24 with `pnpm@10.5.0`.

```bash
pnpm install --frozen-lockfile
pnpm lint:md
pnpm lint:spell
pnpm lint:text
```

`pnpm install --frozen-lockfile` installs the exact locked toolchain.
`pnpm lint:md` checks Markdown structure. `pnpm lint:spell` checks spelling.
`pnpm lint:text` validates Japanese writing quality and technical style. Run
all three before opening a pull request.

## Coding Style & Naming Conventions

Follow `.editorconfig`. Use UTF-8 and LF line endings. Use 2-space
indentation, a final newline, and an 80-character target line width. Prefer
ATX headings (`##`). Prefer fenced code blocks and `-` bullets to match
markdownlint rules.
Name new skills and folders in kebab-case, for example
`skills/release-notes/`. Keep instructions short, imperative, and specific to
the repository.

## Testing Guidelines

There is no separate unit test suite today. Linting is the required quality
gate. Treat every documentation or skill change as complete only after local
lint passes. Run all three commands locally. When adding a new skill, verify
referenced paths manually. Verify example commands manually as well so the
guide stays executable as written.

## Commit & Pull Request Guidelines

Recent history uses concise Conventional Commit style. One example is
`chore: update end_of_line to lf in .editorconfig`. Prefer prefixes like
`feat:`, `fix:`, `docs:`, and `chore:`. Pull requests should follow the
template. Summarize the goal. List concrete changes. Note impact and complete
the local verification checklist. Add screenshots only when a rendered
Markdown change materially affects presentation.
