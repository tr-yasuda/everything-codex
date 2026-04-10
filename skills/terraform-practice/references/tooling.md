# Terraform tooling（周辺ツール）

## 方針

- ローカルでは `fmt`/`validate`/lint/scan を素早く回す。
- CI では最低限 `fmt`/`validate`/`plan` を回し、PR で差分を説明できる状態にする。

## Terraform（CI/自動化の基本フラグ）

```bash
export TF_IN_AUTOMATION=1
terraform init -input=false
terraform validate -no-color
terraform plan -input=false -no-color -detailed-exitcode
```

- CI のログ用途には `-no-color` を付ける。
- 対話入力を避けるため `-input=false` を付ける（不足変数などはエラーで落とす）。

## tflint（lint）

例は次の通りです。

```bash
tflint --init
tflint
```

- ルールセット（AWS/GCP/Azure など）を使う場合は `.tflint.hcl` を整備する。

## tfsec / checkov（セキュリティスキャン）

例は次の通りです。

```bash
tfsec .
checkov -d .
```

- どちらか一方に統一するか、役割分担（例: tfsec=高速、checkov=ポリシー寄り）を決めて運用する。

## terraform-docs（ドキュメント生成）

- module の `README.md` を自動生成/更新する。
- 生成物をコミットするか（差分が見える）/CI で検証だけするか（差分検知）を決める。

## infracost（コスト差分）

- 変更によるコスト差分を PR で可視化する（導入するなら「どの環境が基準か」を決める）。

## pre-commit（ローカル自動化）

- 代表的には `terraform fmt`/`validate`/tflint をフックに入れる。
- 重いスキャン（tfsec/checkov/infracost）は CI 側に寄せる運用も有効。

## CI（例: GitHub Actions）

- セットアップ → `fmt` → `validate` → `plan` の順で実行する。
- `plan` は PR に貼る/Artifact 化するなど、レビューしやすい形にする。
