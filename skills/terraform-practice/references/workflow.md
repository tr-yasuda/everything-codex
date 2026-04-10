# Terraform workflow（実行手順）

## 0. 前提確認（最初にやる）

- 対象ディレクトリ（`-chdir` 含む）と対象環境（dev/stg/prod）を確定する。
- workspace を使う場合は、いま選ばれている workspace を確認する。
  （例: `terraform workspace show`）
- `*.tfvars`/`-var-file` の運用ルールを確認し、意図した入力になっていることを確認する。
- Terraform バージョンと provider 制約を確認する
  （`required_version` / `required_providers` / lockfile）。
- backend と state ロックの方式を確認する（リモート backend + ロック前提）。

## 1. ふだんの流れ（ローカル）

```bash
terraform fmt -recursive
terraform init
terraform validate
terraform plan
```

### `init` の使い分け

- 初回/通常: `terraform init`
- backend 設定を変えた: `terraform init -reconfigure`
- provider を上げたい: `terraform init -upgrade`
- `terraform.lock.hcl` が更新されることもあるため、差分理由を説明
  できるか確認する。

## 2. `plan` のコツ

- 運用では `plan` の差分が説明できることをゴールにする。
- CI で使うなら `terraform plan -detailed-exitcode`（0=差分なし, 2=差分あり, 1=エラー）を使う。
- state ロック競合がある環境では `-lock-timeout=...` を検討する。
- CI のログ整形には `-no-color` を検討する。
いったん保存してレビューしたい場合は `-out` を使い、`terraform show` で出力
します。

```bash
terraform plan -out=plan.out
terraform show -no-color plan.out
```

JSON が必要な場合は次のようになります。

```bash
terraform show -json plan.out > plan.json
```

## 2.1 drift チェック（差分の原因が「ドリフト」か確認）

```bash
terraform plan -refresh-only -detailed-exitcode
```

## 3. `apply` のコツ（危険操作）

- `apply` は必ず明示合意を取る。
- 可能なら `plan` をファイル化して同一内容を適用する（差分の再現性）。

```bash
terraform plan -out=plan.out
terraform apply plan.out
```

## 4. `destroy`（危険操作）

- 目的（全削除が本当に必要か）と対象（環境/ワークスペース/ディレクトリ）を再確認する。
- `destroy` は `plan` と同様に事前に影響範囲を説明できる状態にする。

## 5. `import` と `moved`（状態の整合を取る）

### `import`（既存リソースを state に取り込む）

1. 取り込む先の resource address を確定する（`for_each`/`count` のキーまで含める）。
2. 取り込み後に `plan` が安定する（意図しない差分が出ない）まで調整する。

### `moved`（アドレス移動の宣言）

- リファクタ（module 化、resource 名変更）時は、state を壊さないために `moved` ブロック（Terraform v1.1+）を使う選択肢を検討する。
- `moved` を入れたら `plan` で置換/再作成が発生していないことを確認する。

## 6. state 操作（危険操作）

確認コマンドとしてよく使うものは以下の通りです。

```bash
terraform state list
terraform state show <address>
terraform state pull > state.backup.tfstate
```

移動および削除系（要・明示合意）は以下の通りです。

```bash
terraform state mv <from> <to>
terraform state rm <address>
```

- state 操作は「復旧手段（バックアップ/ロック/権限）」が確認できない限り進めない。
- `-target` は最終手段として扱い、基本は避ける（依存関係を壊しやすい）。

## 7. CI での基本チェック（例）

```bash
export TF_IN_AUTOMATION=1
terraform fmt -check -recursive
terraform init -input=false
terraform validate -no-color
terraform plan -input=false -no-color -detailed-exitcode
```
