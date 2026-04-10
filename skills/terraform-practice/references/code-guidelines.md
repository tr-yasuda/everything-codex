# Terraform code guidelines（設計・規約）

## ディレクトリ/ファイル構成（例）

- ルート: 環境ごとにディレクトリを分けるか、workspace を使うかを
  最初に決めて一貫させる。
- 代表的なファイル分割:
  - `versions.tf`: `terraform { required_version ... }` と `required_providers`
  - `providers.tf`: provider 設定
  - `main.tf`: リソース本体
  - `variables.tf`: 入力
  - `outputs.tf`: 出力（必要最小限、秘匿は `sensitive`）
  - `locals.tf`: 派生値（増やしすぎない）
- コミット対象の指針:
  - `terraform.lock.hcl`: 通常はコミットする（チームの正を優先する）。
  - `.terraform/`: コミットしない。
  - `*.tfvars`: 秘密が入り得るため扱いを決める（コミットするなら秘密を入れない）。

## 環境分離（dev/stg/prod）

- 環境差が大きい場合は「ディレクトリ分割」が分かりやすい（例: `envs/dev`, `envs/prod`）。
- workspace を使う場合は「実行前に `terraform workspace show` で
  現在の設定を確認する」運用を必須とする。
- どの方式でも、PR と実行ログから適用環境を追える状態にする。

## 変数（tfvars）運用

- 変数の入れ方（`*.auto.tfvars`、`-var-file`、TFC/TFE の
  Variable Set など）を 1 つに寄せる。
- `-var-file` 運用の場合は、環境ごとの入力が明示になるように `envs/<env>.tfvars` のように配置する。
- `*.tfvars` に秘密が入り得る場合は、暗号化/別管理（例: secrets manager）を検討する。

## 命名

- 変数/出力/locals: `snake_case` を基本にする。
- module 内の resource 名は慣例に合わせて `this` を使うか、意味のある名前に統一する（混在させない）。
- `for_each` のキーは「将来変わらない識別子」を選ぶ（index ベースの `count` は差分が荒れやすい）。

## 型・validation

- 変数には `type` を付ける（`any` は避ける）。
- 可能なら `validation` で制約をコード化する（例: CIDR 形式、許可する enum、空文字禁止）。
- デフォルト値は安全側に寄せ、必須入力には `default` を置かない。

## モジュール設計

- 目的が 1 つにまとまる粒度で module を切る（巨大 module は避ける）。
- 入出力は最小にし、内部実装（resource 名など）が外に漏れないように
  注意を払う。
- 破壊的変更（名前変更、型変更、意味変更）を伴う場合は、利用側への影響と移行手順をセットで用意する。

## セキュリティ/秘匿

- 秘密情報のコードへの直書きを避ける（state に残る可能性があるものは
  特に注意する）。
- output に秘密が出る場合は `sensitive = true` を付け、必要性を再検討する。
- `sensitive` は「表示」を抑制するだけで、値自体が state から消えるわけではない点に注意する。

## lifecycle の扱い

- `lifecycle { ignore_changes = [...] }` はドリフトや意図しない変更の温床になり得るため、理由をコメントやドキュメントで明確にする。
- `prevent_destroy` は安全策として有効だが、運用手順（解除して削除する流れ）が分からない状態で乱用しない。
