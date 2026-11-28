import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { load } from "js-yaml";

const root = fileURLToPath(new URL("../", import.meta.url));
const namePattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const cjkPattern = /[\u3040-\u30ff\u3400-\u9fff\uf900-\ufaff]/g;

function tokenEstimate(text) {
  const cjk = (text.match(cjkPattern) || []).length;
  const other = Math.max(0, text.length - cjk);
  return Math.round(cjk * 0.9 + other / 4);
}

export function validateSkill(dirName, text) {
  const errors = [];
  const warnings = [];
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) {
    return { errors: ["frontmatter がない"], warnings, fields: {}, body: text };
  }
  let fields;
  try {
    fields = load(match[1]) || {};
  } catch (error) {
    return {
      errors: [`frontmatter を YAML として読めない: ${error.message}`],
      warnings,
      fields: {},
      body: match[2],
    };
  }
  const body = match[2];
  const name = typeof fields.name === "string" ? fields.name : "";
  const description = typeof fields.description === "string" ? fields.description : "";

  if (!name) {
    errors.push("name がない");
  } else {
    if (name.length > 64) errors.push("name が 64 文字を超える");
    if (!namePattern.test(name)) errors.push("name の形式が不正");
    if (name !== dirName) errors.push(`name がディレクトリ名 ${dirName} と一致しない`);
  }
  if (!description) {
    errors.push("description がない");
  } else if (description.length > 1024) {
    errors.push("description が 1,024 文字を超える");
  }

  const bodyLines = body.split("\n").length;
  if (bodyLines > 500) warnings.push(`本文が 500 行を超える (${bodyLines} 行)`);
  const tokens = tokenEstimate(text);
  if (tokens > 5000) warnings.push(`本文が 5,000 トークン概算を超える (${tokens})`);
  return { errors, warnings, fields, body };
}

function repositorySkills() {
  const skillsDir = join(root, "skills");
  return readdirSync(skillsDir)
    .filter((name) => existsSync(join(skillsDir, name, "SKILL.md")))
    .sort()
    .map((name) => ({
      name,
      text: readFileSync(join(skillsDir, name, "SKILL.md"), "utf8"),
    }));
}

test("全 skill が必須の仕様条件を満たす", () => {
  const results = repositorySkills().map(({ name, text }) => ({
    name,
    ...validateSkill(name, text),
  }));
  const failures = results.filter((result) => result.errors.length > 0);
  assert.deepEqual(
    failures.map(({ name, errors }) => `${name}: ${errors.join(", ")}`),
    [],
  );
});

test("現在の skill に 5,000 トークン概算の警告がない", () => {
  const warnings = repositorySkills()
    .map(({ name, text }) => ({ name, ...validateSkill(name, text) }))
    .filter((result) => result.warnings.length > 0)
    .map((result) => result.name);
  assert.deepEqual(warnings, []);
  assert.ok(!warnings.includes("babysit"));
  assert.ok(!warnings.includes("prove-it"));
});

test("不正な name とディレクトリ名の不一致を検出する", () => {
  const result = validateSkill(
    "invalid-skill",
    readFileSync(join(root, "scripts/fixtures/invalid-skill/SKILL.md"), "utf8"),
  );
  assert.ok(result.errors.includes("name の形式が不正"));
  assert.ok(result.errors.includes("name がディレクトリ名 invalid-skill と一致しない"));
});

test("長すぎる description と本文を検出する", () => {
  const description = "x".repeat(1025);
  const body = `${"line\n".repeat(501)}`;
  const result = validateSkill(
    "long-skill",
    `---\nname: long-skill\ndescription: ${description}\n---\n${body}`,
  );
  assert.ok(result.errors.includes("description が 1,024 文字を超える"));
  assert.ok(result.warnings.some((warning) => warning.includes("500 行")));
});

test("babysit の参照ファイルが存在し、本体から読むよう指定されている", () => {
  const skillDir = join(root, "skills/babysit");
  const text = readFileSync(join(skillDir, "SKILL.md"), "utf8");
  const references = [...new Set(
    [...text.matchAll(/`(references\/[a-z-]+\.md)`/g)].map((match) => match[1]),
  )].sort();
  assert.deepEqual(references, [
    "references/ci-fix.md",
    "references/merge-conflict.md",
    "references/pr-operations.md",
    "references/review-and-reply.md",
  ]);
  assert.match(text, /必ず読む/);
  assert.match(text, /Draft を理由に状態取得や修正を省略しない/);
  for (const reference of references) {
    assert.ok(existsSync(join(skillDir, reference)), reference);
  }
});
