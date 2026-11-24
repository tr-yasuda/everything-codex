import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  cpSync,
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

function documentFixture(t) {
  const root = mkdtempSync(join(tmpdir(), "shared-text-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const paths = [
    "README.md", "docs", "cookbooks", "skills", "scripts/sync-shared-text.mjs",
  ];
  for (const path of paths) {
    cpSync(new URL(`../${path}`, import.meta.url), join(root, path), {
      recursive: true,
    });
  }
  symlinkSync(
    fileURLToPath(new URL("../node_modules", import.meta.url)),
    join(root, "node_modules"),
    "junction",
  );
  return root;
}

function runSync(root, ...args) {
  return spawnSync(
    process.execPath,
    [join(root, "scripts/sync-shared-text.mjs"), ...args],
    { encoding: "utf8" },
  );
}

function conditionBlock(root, path, id) {
  const start = `<!-- shared-text:${id}:start -->\n`;
  const end = `<!-- shared-text:${id}:end -->`;
  const text = readFileSync(join(root, path), "utf8")
    .split(start)[1]?.split(end)[0];
  assert.ok(text?.trim(), `${path}: ${id}`);
  return { start, end, text };
}

test("文書の共通条件と起動設定が更新元と一致する", () => {
  const result = runSync(fileURLToPath(new URL("../", import.meta.url)));
  assert.equal(result.status, 0, result.stderr);
});

test("同期済みの文書に再実行しても変更しない", (t) => {
  const root = documentFixture(t);
  const result = runSync(root, "--write");
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout, "");
});

test("README の承認条件の更新漏れを検出し、検査では文書を書き換えない", (t) => {
  const root = documentFixture(t);
  const path = join(root, "README.md");
  const { start, text } = conditionBlock(root, "README.md", "babysit-approval");
  const changed = readFileSync(path, "utf8").replace(
    start + text,
    start + text + "テスト用の不一致。\n",
  );
  writeFileSync(path, changed);
  const result = runSync(root);
  assert.equal(result.status, 1, result.stderr);
  assert.match(result.stderr, /README\.md.*babysit-approval/);
  assert.equal(readFileSync(path, "utf8"), changed);
});

for (const [id, skill, targets] of [
  ["recheck-pr-approval", "recheck-pr", [
    "docs/skills.md", "cookbooks/recheck-pr.md",
  ]],
  ["babysit-approval", "babysit", [
    "README.md", "docs/skills.md", "cookbooks/maintain-pr.md",
  ]],
  ["update-deps-scope", "update-deps", [
    "docs/skills.md", "cookbooks/update-deps.md",
  ]],
  ["what-breaks-trigger", "what-breaks", ["docs/skills.md"]],
]) {
  test(`${skill} の条件変更を検出し、説明先へ反映できる`, (t) => {
    const root = documentFixture(t);
    const source = join(root, `skills/${skill}/SKILL.md`);
    const { start, text } = conditionBlock(
      root, `skills/${skill}/SKILL.md`, id,
    );
    const updated = start + text + "テスト用に追加した条件。\n";
    const changedSource = readFileSync(source, "utf8")
      .replace(start + text, updated);
    writeFileSync(source, changedSource);
    const before = targets.map((path) => ({
      path,
      document: readFileSync(join(root, path), "utf8"),
    }));

    const check = runSync(root);

    assert.equal(check.status, 1, check.stderr);
    assert.ok(check.stderr.includes(id), check.stderr);
    const write = runSync(root, "--write");
    assert.equal(write.status, 0, write.stderr);
    for (const { path, document } of before) {
      assert.equal(
        readFileSync(join(root, path), "utf8"),
        document.replace(start + text, updated),
      );
    }
    assert.equal(readFileSync(source, "utf8"), changedSource);
    assert.equal(runSync(root).status, 0);
  });
}

for (const [name, corrupt] of [
  ["マーカー欠落", (document, { start, end, text }) =>
    document.replace(start + text + end, "")],
  ["マーカー重複", (document, { start }) =>
    document.replace(start, start + start)],
  ["行末空白付き開始マーカーの重複", (document, { start }) =>
    document.replace(start, start.trimEnd() + " \n古い条件。\n" + start)],
  ["行末タブ付き開始マーカーの重複", (document, { start }) =>
    document.replace(start, start.trimEnd() + "\t\n古い条件。\n" + start)],
  ["開始マーカー後の改行欠落", (document, { start }) =>
    document.replace(start, start.trimEnd() + " ")],
  ["マーカー逆順", (document, { start, end, text }) =>
    document.replace(start + text + end, end + text + start)],
  ["空の範囲", (document, { start, text }) =>
    document.replace(start + text, start + "   \n")],
  ["入れ子", (document, { start, text }) => document.replace(
      start + text, start + "<!-- shared-text:unknown:start -->\n条件\n",
  )],
]) {
  test(`${name}では、ほかの文書も書き換えずに止まる`, (t) => {
    const root = documentFixture(t);
    const source = join(root, "skills/babysit/SKILL.md");
    const block = conditionBlock(
      root, "skills/babysit/SKILL.md", "babysit-approval",
    );
    writeFileSync(source, readFileSync(source, "utf8").replace(
      block.start + block.text,
      block.start + block.text + "テスト用に追加した条件。\n",
    ));
    const target = join(root, "cookbooks/maintain-pr.md");
    writeFileSync(target, corrupt(readFileSync(target, "utf8"), block));
    const paths = [
      source, target, join(root, "README.md"), join(root, "docs/skills.md"),
    ];
    const before = paths.map((path) => readFileSync(path, "utf8"));

    const result = runSync(root, "--write");

    assert.equal(result.status, 1, result.stderr);
    assert.match(result.stderr, /cookbooks\/maintain-pr\.md.*babysit-approval/);
    assert.deepEqual(paths.map((path) => readFileSync(path, "utf8")), before);
  });
}

test("Skill の手動・自動と呼び出し設定・一覧の不一致を検出する", (t) => {
  for (const [path, change] of [
    ["skills/babysit/agents/openai.yaml", (text) => text.replace(
      /(allow_implicit_invocation: )(true|false)/,
      (_, key, value) => key + (value === "true" ? "false" : "true"),
    )],
    ["skills/babysit/SKILL.md", (text) => text.replace(
      /(disable-model-invocation: )(true|false)/,
      (_, key, value) => key + (value === "true" ? "false" : "true"),
    )],
    ["docs/skills.md", (text) => text.replace(
      /(### babysit\n[\s\S]*?\*\*起動：\*\* )(手動|自動)/,
      (_, prefix, mode) => prefix + (mode === "手動" ? "自動" : "手動"),
    )],
  ]) {
    const root = documentFixture(t);
    const file = join(root, path);
    const original = readFileSync(file, "utf8");
    const changed = change(original);
    assert.notEqual(changed, original);
    writeFileSync(file, changed);

    const result = runSync(root);

    assert.equal(result.status, 1, result.stderr);
    assert.match(result.stderr, /babysit.*起動/);
  }
});

for (const [name, setting] of [
  ["複数行の true", "disable-model-invocation:\n  true"],
  ["コロン前の空白", "disable-model-invocation : true"],
  ["引用符付きキー", '"disable-model-invocation": true'],
  ["値なし", "disable-model-invocation:"],
  ["空白だけの値", "disable-model-invocation:   "],
  ["文字列の false", 'disable-model-invocation: "false"'],
]) {
  test(`起動設定（${name}）は検査・同期とも書き込まずに失敗する`, (t) => {
    const root = documentFixture(t);
    const source = join(root, "skills/catch-up/SKILL.md");
    writeFileSync(source, readFileSync(source, "utf8").replace(
      "\n---\n", `\n${setting}\n---\n`,
    ));

    const pendingSource = join(root, "skills/babysit/SKILL.md");
    const block = conditionBlock(
      root, "skills/babysit/SKILL.md", "babysit-approval",
    );
    writeFileSync(pendingSource, readFileSync(pendingSource, "utf8").replace(
      block.start + block.text,
      block.start + block.text + "テスト用に追加した条件。\n",
    ));
    const paths = [
      source, pendingSource, join(root, "README.md"), join(root, "docs/skills.md"),
      join(root, "cookbooks/maintain-pr.md"),
    ];
    const before = paths.map((path) => readFileSync(path, "utf8"));

    for (const args of [[], ["--write"]]) {
      const result = runSync(root, ...args);
      assert.equal(result.status, 1, result.stderr);
      assert.match(result.stderr, /catch-up.*起動/);
      assert.equal(result.stdout, "");
      assert.deepEqual(paths.map((path) => readFileSync(path, "utf8")), before);
    }
  });
}

for (const [name, format] of [
  ["複数行", (value) => `disable-model-invocation:\n  ${value}`],
  ["コロン前の空白", (value) => `disable-model-invocation : ${value}`],
  ["引用符付きキー", (value) => `"disable-model-invocation": ${value}`],
]) {
  test(`YAML の${name}で書かれた真偽値が他の起動設定と一致すれば成功する`, (t) => {
    for (const [skill, value] of [["catch-up", false], ["babysit", true]]) {
      const root = documentFixture(t);
      const path = join(root, `skills/${skill}/SKILL.md`);
      const changed = readFileSync(path, "utf8")
        .replace(/^disable-model-invocation: true\n/m, "")
        .replace("\n---\n", `\n${format(value)}\n---\n`);
      writeFileSync(path, changed);

      for (const args of [[], ["--write"]]) {
        const result = runSync(root, ...args);
        assert.equal(result.status, 0, result.stderr);
        assert.equal(result.stdout, "");
        assert.equal(readFileSync(path, "utf8"), changed);
      }
    }
  });
}

// 各 skill は単体で配布するため、停止判断の定義を共有ファイルに切り出せない。
// 定義が異なると、同じ変更で止まる skill と止まらない skill ができる。
const agreedScope = [
  "合意した内容とは、ユーザーが依頼や会話で明示したか、提案を承認した事項を指す。",
  "対象は、仕様・変更範囲・契約・前提とする。",
  "契約とは、仕様に書かれた振る舞いと、リポジトリの外の利用者やシステムが依存する形を指す。",
  "内部の型・関数名・モジュール構成は、ユーザーが明示して指定したか、提案を承認したものだけを対象にする。",
  "契約に当たるか判断がつかなければ、契約として扱う。",
].join("\n");

const skills = ["catch-up", "tdd", "what-breaks"];

for (const skill of skills) {
  test(`${skill} が合意の対象の定義を同じ文で持つ`, () => {
    const path = new URL(`../skills/${skill}/SKILL.md`, import.meta.url);
    assert.ok(
      readFileSync(path, "utf8").includes(agreedScope),
      `skills/${skill}/SKILL.md の定義が、scripts/shared-text.test.mjs の定義と一致しない`,
    );
  });
}

// babysit は他の skill を起動せず、この相対パスの手順ファイルを直接読む。
// 参照が壊れると作業を開始できないため、文面ではなく参照先を検査する。
test("babysit が参照する手順ファイルが存在する", () => {
  const babysit = new URL("../skills/babysit/SKILL.md", import.meta.url);
  const references = [
    ...new Set(
      [...readFileSync(babysit, "utf8").matchAll(/`(\.\.\/[a-z-]+\/SKILL\.md)`/g)]
        .map((match) => match[1]),
    ),
  ];

  assert.deepEqual(
    [...references].sort(),
    ["../fix-ci/SKILL.md"],
    "skills/babysit/SKILL.md が参照する手順ファイルが fix-ci だけになっていない",
  );
  for (const reference of references) {
    assert.ok(
      existsSync(new URL(reference, babysit)),
      `skills/babysit/SKILL.md が参照する ${reference} が存在しない`,
    );
  }
});
