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

「完了したタスクを削除するか、表示だけ切り替えるか」のように、解決案の違いを相談します。
欲しい状態と作るものを短い仕様にまとめ、合意するところまで。実装はまだ始めません。
[相談から実装までの例](cookbooks/new-feature.md)

### 任せた作業の状況が分からなくなった

```text
今どこまで終わっていて、私が判断することは何？
```

`catch-up` が、完了したこと・未解決のこと・判断が必要な点を整理します。
選択肢ごとの影響を読んで、次の方針を決められます。
[判断材料を読んで返答する例](cookbooks/catch-up.md)

### レビュー指摘を、そのまま全部直してよいか迷う

```text
$fix-pr pr#123
```

指摘をコードやテストで確かめ、妥当なものだけを修正。検証・commit・push まで進めます。
修正しなかった理由も報告し、返信案は自分が承認するまで送信されません。
[レビュー対応の例](cookbooks/maintain-pr.md#レビュー指摘に対応したい)

## 使い始める

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

ほかの skill も、使いたいディレクトリを同じように追加できます。
自動で使われる skill は、導入すると該当する場面でエージェントが使います。

## ほかの使い道を探す

- [目的別の cookbook](cookbooks/README.md): 機能追加、CI 修正、PR 作成などの依頼と、完了までの進め方。
- [skill 一覧](docs/skills.md): 全 skill の用途、手動・自動の区別、詳しい手順へのリンク。
- [開発者向けガイド](CONTRIBUTING.md): このリポジトリの構成、Codex の設定、変更時の検証方法。

## ライセンス

[MIT License](LICENSE)

[codex-skills]: https://learn.chatgpt.com/docs/build-skills
[claude-skills]: https://code.claude.com/docs/en/skills
