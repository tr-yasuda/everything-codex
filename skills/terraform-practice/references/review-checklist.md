# Terraform review checklist（PR/差分レビュー）

## 最優先（事故防止）

- `-/+`（replace）や `destroy` が出ていないか。出ているなら理由と影響/移行手順が明確か。
- `known after apply` が増えていないか。増えた理由が説明できるか。
- `for_each`/`count` のキー変更で大量差分になっていないか。
- backend/state/ロックの前提が変わっていないか（意図せず local state になっていないか）。
- `terraform.lock.hcl` の差分がある場合、意図した更新（例: `init -upgrade`）か。

## 変更の妥当性

- 命名/タグ/ラベルが規約に沿っているか。
- 変数の型/validation/デフォルトが安全か。
- module の入出力が増えすぎていないか（責務が肥大化していないか）。
- `lifecycle`（`ignore_changes`/`prevent_destroy`/`create_before_destroy`）の追加・変更が妥当か。

## セキュリティ/コンプライアンス

- 0.0.0.0/0 や広すぎる権限が入っていないか（例: SG/Firewall、IAM）。
- 秘密情報が state/output/log に残らない設計か。
- スキャン結果（tfsec/checkov 等）に新規の High/Critical がないか。
- output/variable の `sensitive` が必要箇所に付いているか（付けすぎて運用性が落ちていないかも確認）。

## 運用性

- 変更がロールバック可能か（破壊的なら復旧手段があるか）。
- タイムアウト/リトライ/依存関係が妥当か（適用順の意図があるか）。
- README/terraform-docs など利用者向け情報が更新されているか。
