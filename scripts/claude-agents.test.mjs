import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { load } from "js-yaml";

const root = fileURLToPath(new URL("../", import.meta.url));

function readFrontmatter(path) {
  const match = readFileSync(path, "utf8").match(/^---\n([\s\S]*?)\n---\n/);
  assert.ok(match, `${path}: frontmatter が必要です。`);
  return load(match[1], { filename: path });
}

function readClaudeAgents() {
  const directory = join(root, "claude/agents");
  return new Map(readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => {
      const path = join(directory, entry.name);
      return [entry.name.replace(/\.md$/, ""), readFrontmatter(path)];
    }));
}

function readSkill(skill) {
  return readFrontmatter(join(root, "skills", skill, "SKILL.md"));
}

test("Claude 用 subagent の役割・モデル・推論量を維持する", () => {
  const expected = new Map([
    ["docs-researcher", {
      model: "haiku",
      effort: "low",
      tools: ["Read", "Grep", "Glob", "WebFetch", "WebSearch"],
    }],
    ["explorer", {
      model: "sonnet",
      effort: "medium",
      tools: ["Read", "Grep", "Glob"],
    }],
    ["implementer", {
      model: "sonnet",
      effort: "medium",
      permissionMode: "acceptEdits",
      tools: [
        "Read", "Grep", "Glob", "Bash", "Edit", "Write", "NotebookEdit", "Agent",
      ],
    }],
    ["reviewer", {
      model: "opus",
      effort: "high",
      tools: ["Read", "Grep", "Glob", "Bash", "Agent"],
    }],
    ["verifier", {
      model: "sonnet",
      effort: "medium",
      tools: ["Read", "Grep", "Glob", "Bash", "Agent"],
    }],
  ]);
  const agents = readClaudeAgents();

  assert.deepEqual([...agents.keys()].sort(), [...expected.keys()].sort());
  for (const [name, settings] of expected) {
    const agent = agents.get(name);
    assert.equal(agent.name, name);
    assert.equal(agent.model, settings.model);
    assert.equal(agent.effort, settings.effort);
    assert.equal(agent.permissionMode, settings.permissionMode);
    assert.deepEqual(agent.tools, settings.tools);
    assert.ok(agent.description, `${name}: description が必要です。`);
  }
});

test("agent と skill の接続が定義どおりで、参照先が存在する", () => {
  const agents = readClaudeAgents();
  const preloadedSkills = new Map([
    ["implementer", ["tdd"]],
  ]);
  const forkedSkills = new Map([
    ["research", "docs-researcher"],
    ["multi-scan", "reviewer"],
  ]);

  for (const [agent, skills] of preloadedSkills) {
    assert.deepEqual(agents.get(agent).skills, skills);
    for (const skill of skills) {
      assert.ok(readSkill(skill).name, `${agent}: ${skill} が存在しません。`);
    }
  }
  for (const [name, agent] of agents) {
    if (!preloadedSkills.has(name)) {
      assert.equal(
        agent.skills,
        undefined,
        `${name}: 意図しない skill を事前読み込みしています。`,
      );
    }
  }
  for (const [skill, agent] of forkedSkills) {
    const metadata = readSkill(skill);
    assert.equal(metadata.context, "fork");
    assert.equal(metadata.agent, agent);
    assert.ok(agents.has(agent), `${skill}: ${agent} が存在しません。`);
    assert.ok(
      !agents.get(agent).skills?.includes(skill),
      `${skill} は agent 側でも読み込むと二重になります。`,
    );
  }
  for (const entry of readdirSync(join(root, "skills"), { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const metadata = readSkill(entry.name);
    if (metadata.context === "fork") {
      assert.ok(
        forkedSkills.has(entry.name),
        `${entry.name}: 意図しない skill が subagent 上で実行されます。`,
      );
    }
  }
});
