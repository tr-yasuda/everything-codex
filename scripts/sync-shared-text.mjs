import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { load } from "js-yaml";

const root = new URL("../", import.meta.url);
const sharedText = [
  {
    id: "fix-pr-approval",
    source: "skills/fix-pr/SKILL.md",
    targets: ["README.md", "docs/skills.md", "cookbooks/maintain-pr.md"],
  },
  {
    id: "babysit-approval",
    source: "skills/babysit/SKILL.md",
    targets: ["docs/skills.md", "cookbooks/maintain-pr.md"],
  },
  {
    id: "update-deps-scope",
    source: "skills/update-deps/SKILL.md",
    targets: ["docs/skills.md", "cookbooks/update-deps.md"],
  },
  {
    id: "what-breaks-trigger",
    source: "skills/what-breaks/SKILL.md",
    targets: ["docs/skills.md"],
  },
];

function readBlock(document, id, path) {
  const startMarker = `<!-- shared-text:${id}:start -->`;
  const endMarker = `<!-- shared-text:${id}:end -->`;
  const markerEnd = document.indexOf(startMarker) + startMarker.length;
  const start = markerEnd + 1;
  const end = document.indexOf(endMarker);
  if (
    document.split(startMarker).length !== 2 ||
    document.split(endMarker).length !== 2 ||
    document[markerEnd] !== "\n" ||
    end <= start
  ) {
    throw new Error(`${path}: ${id} の開始・終了マーカーを 1 組ずつ指定してください。`);
  }
  const text = document.slice(start, end);
  if (!text.trim() || text.includes("<!-- shared-text:")) {
    throw new Error(`${path}: ${id} の範囲を空にしたり、入れ子にしたりできません。`);
  }
  return { start, end, text };
}

function validateInvocationSettings(root, readDocument) {
  const catalog = readDocument("docs/skills.md");
  const entries = readdirSync(new URL("skills/", root), {
    withFileTypes: true,
  });
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const skill = entry.name;
    const skillPath = `skills/${skill}/SKILL.md`;
    const metadataText = readDocument(skillPath)
      .match(/^---\n([\s\S]*?)\n---\n/)?.[1];
    const metadata = metadataText && load(metadataText, {
      filename: skillPath,
    });
    const invalidSettingMessage =
      `${skill}: 起動設定の disable-model-invocation は真偽値で指定してください。`;
    if (
      !metadata ||
      typeof metadata !== "object" ||
      Array.isArray(metadata)
    ) {
      throw new Error(invalidSettingMessage);
    }

    const disableModelInvocation = metadata["disable-model-invocation"];
    if (
      Object.hasOwn(metadata, "disable-model-invocation") &&
      typeof disableModelInvocation !== "boolean"
    ) {
      throw new Error(invalidSettingMessage);
    }
    const manual = disableModelInvocation === true;
    const policyPath = `skills/${skill}/agents/openai.yaml`;
    const policy = load(readDocument(policyPath), { filename: policyPath })
      ?.policy?.allow_implicit_invocation;
    const skillSection = catalog.split(`\n### ${skill}\n`)[1]
      ?.split(/\n#{1,3} /)[0];
    const documentedMode = skillSection
      ?.match(/^\*\*起動：\*\* (手動|自動)/m)?.[1];
    const expectedPolicy = !manual;
    const expectedMode = manual ? "手動" : "自動";
    if (policy !== expectedPolicy || documentedMode !== expectedMode) {
      throw new Error(
        `${skill}: 起動設定と agents/openai.yaml・docs/skills.md の手動・自動が一致しません。`,
      );
    }
  }
}

try {
  const write = process.argv.length === 3 && process.argv[2] === "--write";
  if (process.argv.length > 2 && !write) {
    throw new Error("使い方: node scripts/sync-shared-text.mjs [--write]");
  }

  const originals = new Map();
  function readDocument(path) {
    if (!originals.has(path)) {
      originals.set(path, readFileSync(new URL(path, root), "utf8"));
    }
    return originals.get(path);
  }

  validateInvocationSettings(root, readDocument);

  const updates = new Map();
  const mismatches = [];
  for (const { id, source, targets } of sharedText) {
    const original = readBlock(readDocument(source), id, source);
    for (const target of targets) {
      const document = updates.get(target) ?? readDocument(target);
      const block = readBlock(document, id, target);
      if (block.text !== original.text) {
        mismatches.push(`${target}: ${id} が ${source} と一致しません。`);
        updates.set(
          target,
          document.slice(0, block.start) +
            original.text + document.slice(block.end),
        );
      }
    }
  }
  if (!write && mismatches.length > 0) {
    throw new Error(mismatches.join("\n"));
  }
  if (write) {
    for (const [path, document] of updates) {
      writeFileSync(new URL(path, root), document);
      process.stdout.write(`${path}\n`);
    }
  }
} catch (error) {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
}
