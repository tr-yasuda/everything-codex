# everything-codex

> **開発は任せる。判断は、手放さない。**

何を作るか、なぜこの設計か、レビュー指摘を受け入れるべきか。
Codex・Claude Code に作業を任せながら、自分で理解し、判断するための skill 集です。
skill は、必要な場面でエージェントが読む、作業の進め方をまとめたものです。

## 例えば、こんなとき

以下は、それぞれの skill を導入したあとの依頼例です。
Claude Code では、`$fix-pr` を `/fix-pr` のように読み替えてください。

### 作り始める前に、欲しいものを整理したい

```text
$define タスク一覧が見づらい。未完了を見つけやすくしたい。
```

欲しい状態を相談し、実装前に短い仕様へまとめます。
[相談から実装までの例](cookbooks/new-feature.md)

### 任せた作業の状況が分からなくなった

```text
今どこまで終わっていて、私が判断することは何？
```

`catch-up` が状況と判断材料を整理し、次の方針を決められるようにします。
[判断材料を読んで返答する例](cookbooks/catch-up.md)

### レビュー指摘を、そのまま全部直してよいか迷う

```text
$fix-pr pr#123
```

指摘を確かめて必要な修正を commit・push します。
<!-- shared-text:fix-pr-approval:start -->
返信は、ユーザーが文面を承認してから送信します。
<!-- shared-text:fix-pr-approval:end -->
[レビュー対応の例](cookbooks/maintain-pr.md#レビュー指摘に対応したい)

## 使い始める

全プロジェクトで使うための導入・更新・読み込み確認は、[導入ガイド](docs/installation.md) を参照してください。

まずは `define` だけで試せます。Codex または Claude Code を使っているプロジェクトを用意してください。

1. このリポジトリを取得する。

   ```bash
   git clone https://github.com/tr-yasuda/everything-codex.git
   ```

2. 取得した `skills/define/` を、使いたいプロジェクトの次の場所へ、ディレクトリごとコピーする。

   | エージェント | プロジェクト内の配置先 | 呼び出し |
   | --- | --- | --- |
   | [Codex][codex-skills] | `.agents/skills/define/` | `$define` |
   | [Claude Code][claude-skills] | `.claude/skills/define/` | `/define` |

3. 対象のプロジェクトをエージェントで開き、新しい会話で依頼する。

   ```text
   $define
   このプロジェクトで改善したいことを、実装前に相談したい。
   ```

   自分の困りごとを続けて書く。Claude Code では、先頭を `/define` に置き換える。

ほかの skill も、使いたいディレクトリを同じように追加できます。`babysit` は、`fix-ci`・`fix-pr`・`fix-conflicts` と一緒に追加します。
自動で使われる skill は、導入すると該当する場面でエージェントが使います。

## 目的に合う文書へ進む

| 知りたいこと | 読む文書 |
| --- | --- |
| 具体的な状況で、何を頼み、何を確認すれば完了するか | [目的別の cookbook](cookbooks/README.md) |
| skill の用途、呼び出し方、何を変更・投稿するか | [skill 一覧](docs/skills.md) |
| エージェントの作業手順と制約 | [skill 一覧](docs/skills.md) の各項目にある `SKILL.md` のリンク |
| 文書を変更するときに、どこを更新するか | [開発者向けガイド](CONTRIBUTING.md#文書の役割と更新方法) |

## ライセンス

[MIT License](LICENSE)

[codex-skills]: https://learn.chatgpt.com/docs/build-skills
[claude-skills]: https://code.claude.com/docs/en/skills
