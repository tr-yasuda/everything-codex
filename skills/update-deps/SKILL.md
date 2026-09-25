---
name: update-deps
description: Repository の構成から依存関係の管理方法を判断し、指定された依存関係を更新・検証する skill。
---

# Update Deps

1. Repository の指示、manifest、lockfile、設定から、使用する ecosystem と標準的な更新方法を判断する。
   判断できない場合は更新前に確認する。
2. 指定された依存関係を更新対象とし、整合性維持に必要な関連依存関係だけを加える。
   対象が未指定なら確認し、確認前に更新しない。
3. Version 制約、runtime 要件、peer dependencies、変更点を確認する。
   Version の指定がなければ、互換性の範囲内の安定版を選ぶ。
   Major update と runtime 変更は、明示的に指定された場合のみ実施する。
   Major update、破壊的変更の兆候、要件変更、判断材料の不足がある場合は、
   公式の release notes や migration guide などを確認する。
4. Repository の標準的な方法で更新し、manifest と lockfile の整合性を保つ。
5. 必要なコード、設定、テストを追従修正する。
6. 関連する test、型チェック、lint、build を実行する。
7. 更新前後の version、追従修正、検証結果、残った制約を報告する。

無関係な依存関係や既存の作業ツリーの変更は保持する。
commit、push、公開は行わない。
