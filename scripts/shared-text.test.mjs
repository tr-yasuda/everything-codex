import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
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
