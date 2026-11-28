# merge conflict と base の取り込み

PR が base branch より遅れている、または merge conflict があるときに読む。

1. 対象 PR と base branch、PR のブランチを特定する
2. remote の最新状態を取得する
3. base branch の最新変更を PR のブランチへ merge する
4. conflict を確認し、base 側と PR 側の変更意図を読む
5. 両方の変更を維持する必要があるかを確認して解消する
6. 関連するテスト・型チェック・lint・build を実行する
7. merge を commit する
8. PR のブランチへ push する

`ours` / `theirs` の一括採用で解消しない。
既存の仕様やテストから判断できない仕様判断が必要な場合は、推測で決めずに止まる。
conflict 解消に必要な範囲だけ変更し、無関係なリファクタリングや仕様変更をしない。

merge commit を使用し、conflict 解消後に追加修正した場合は別の commit に分けてよい。
rebase と force push は行わない。
