---
name: finishing-changes
description: >-
  実装済みの変更を commit、push、PR 作成、統合の依頼に合わせて仕上げるときに使う。
---

# Finishing Changes

## 差分を仕上げる

依頼された到達点と現在の branch、比較元、差分を確認する。
無関係な作業や既存の staged changes を混ぜない。
[reviewing-changes](../reviewing-changes/SKILL.md) と
[verifying-changes](../verifying-changes/SKILL.md) で確認する。
すでに確認済みで対象が変わっていなければ、結果を再利用する。

## 依頼された操作を行う

commit は対象差分だけを stage し、リポジトリの規約に沿って作成する。
push は remote と branch を確認し、通常の push を使う。
PR は比較元と既存 PR を調べ、重複作成を避ける。

PR 本文は、解決する問題、変更後の動作、検証結果、残件を記載する。
テンプレートがあれば従い、実行していない確認を済みと書かない。
本文はファイルに保存し、CLI では --body-file で渡す。

依頼や既存の承認に含まれる操作を進める。
追加承認が必要な操作は、その前に差分と投稿内容を確認可能にする。
単なる実装依頼を、merge、公開、branch 削除の指示とは扱わない。
履歴の強制更新や作業の破棄を、通常の仕上げに含めない。

## 結果を伝える

実際に行った操作と、commit または PR の参照先を示す。
ローカルでの確認とリモート CI の状態を区別する。
残っている作業場所と未完了事項があれば伝える。
