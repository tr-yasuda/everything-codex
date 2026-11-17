import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";

// skill は単体で動くため、合意の対象の定義を各 SKILL.md が同じ文で持つ。
// 定義を変えるときは、この一覧と全ファイルを同時に直す。
// 一部だけ直すと、同じ変更で止まる skill と止まらない skill ができる。
const agreedScope = [
  "合意した内容とは、ユーザーが依頼や会話で明示したか、提案を承認した事項を指す。",
  "対象は、仕様・変更範囲・契約・前提とする。",
  "契約とは、仕様に書かれた振る舞いと、リポジトリの外の利用者やシステムが依存する形を指す。",
  "内部の型・関数名・モジュール構成は、ユーザーが明示して指定したか、提案を承認したものだけを対象にする。",
  "契約に当たるか判断がつかなければ、契約として扱う。",
].join("\n");

const skills = ["catch-up", "design-interface", "tdd", "what-breaks"];

for (const skill of skills) {
  test(`${skill} が合意の対象の定義を同じ文で持つ`, () => {
    const path = new URL(`../skills/${skill}/SKILL.md`, import.meta.url);
    assert.ok(
      readFileSync(path, "utf8").includes(agreedScope),
      `skills/${skill}/SKILL.md の定義が、scripts/shared-text.test.mjs の定義と一致しない`,
    );
  });
}

// babysit は fix-ci・fix-pr・fix-conflicts の SKILL.md を相対パスで読み、読めなければ止まる。
// 参照先の改名や参照の書き換えは lint では検出できないため、参照パスが実在することだけを確かめる。
// 手順の文言は改善のたびに変わるので、ここでは照合しない。
test("babysit が参照する手順ファイルが存在する", () => {
  const babysit = new URL("../skills/babysit/SKILL.md", import.meta.url);
  const references = [...readFileSync(babysit, "utf8").matchAll(/`(\.\.\/[a-z-]+\/SKILL\.md)`/g)].map(
    (match) => match[1],
  );

  assert.deepEqual(
    [...references].sort(),
    ["../fix-ci/SKILL.md", "../fix-conflicts/SKILL.md", "../fix-pr/SKILL.md"],
    "skills/babysit/SKILL.md が参照する手順ファイルが、fix-ci・fix-pr・fix-conflicts の 3 つと一致しない",
  );
  for (const reference of references) {
    assert.ok(
      existsSync(new URL(reference, babysit)),
      `skills/babysit/SKILL.md が参照する ${reference} が存在しない`,
    );
  }
});
