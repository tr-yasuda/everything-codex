# reply-templates

## 使い方

- `{...}` を実値で置き換えて使う。
- 返信は長文にせず、2〜4 文を目安にする。

## action_required

### 日本語

```
ご指摘ありがとうございます。`{summary_of_fix}` を反映しました。
確認として `{validation}` を実施しています。必要であれば追加観点も対応します。
```

### English

```
Thanks for the review. I updated `{summary_of_fix}`.
I validated it with `{validation}`. I can follow up if you want additional checks.
```

## no_action

### 日本語

```
ご提案ありがとうございます。今回は `{reason}` のため、このPRでは変更しません。
必要なら別PRで `{alternative}` として切り出します。
```

### English

```
Thanks for the suggestion. I am not changing this in the current PR because `{reason}`.
If needed, I can handle `{alternative}` in a separate PR.
```

## needs_clarification

### 日本語

```
意図を正確に反映したいため確認させてください。`{question}` を想定していますが、認識は合っていますか？
方針が決まり次第、対応してこのスレッドで共有します。
```

### English

```
I want to make sure I apply your intent correctly. I am assuming `{question}`. Is that correct?
Once confirmed, I will apply the change and update this thread.
```
