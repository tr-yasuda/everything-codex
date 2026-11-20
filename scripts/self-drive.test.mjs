import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const root = new URL("../", import.meta.url);

function read(path) {
  return readFileSync(new URL(path, root), "utf8");
}

test("self-drive の並列・再開・Draft PR の契約を保つ", () => {
  const config = read("codex/config.toml");
  const limits = [...config.matchAll(
    /^max_concurrent_threads_per_session = (\d+)$/gm,
  )];
  assert.equal(limits.length, 1);
  assert.equal(limits[0][1], "20");

  const skill = read("skills/self-drive/SKILL.md");
  for (const text of [
    "書き込み担当ごとに worktree / branch",
    "同時実行数は 20 を上限",
    "リポジトリ外",
    "$CODEX_HOME/self-drive/<project-slug>/<run-id>/",
    "run.md",
    "元のタスク参照",
    "ラン記録",
    "PR・commit・リポジトリ内ファイルには含めない",
    "Git branch・PR・Issue / Jira の現在状態",
    "$create-pr",
    "Draft PR",
    "merge・Issue close・Jira の状態変更",
  ]) {
    assert.ok(skill.includes(text), `self-drive SKILL.md: ${text}`);
  }

  const agent = read("skills/self-drive/agents/openai.yaml");
  assert.match(agent, /worktree/);
  assert.match(agent, /Draft PR/);

  for (const path of ["README.md", "docs/skills.md"]) {
    const document = read(path);
    assert.match(document, /Draft PR/);
    assert.match(document, /ラン記録/);
  }
});
