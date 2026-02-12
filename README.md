# auto-diary-creation-system

[English](./docs/lang/en.md) | 日本語

## 概要

Notion の更新ページを収集し、OpenAI で要約して、日次の要約ページを Notion の日記データベースへ自動作成する Google Apps Script（GAS）プロジェクトです。

主な処理の流れ:

1. 直近24時間で更新された Notion ページを取得
2. 各ページ本文を抽出して OpenAI で要約
3. 要約一覧を Notion の日記DBに1ページとして作成
4. エラー発生時は LINE へ通知

## セットアップ

### 1. Notion 側の準備

1. Internal Integration を作成し、トークンを取得
2. 日記を書き込む対象DBに Integration を接続（Share / Add connections）
3. 対象DBのタイトル列名を確認（`DIARY_TITLE_PROPERTY` と一致させる）

### 2. Script Properties の設定

GASエディタの「プロジェクトの設定 > スクリプト プロパティ」に以下を登録します。

- `NOTION_TOKEN`
- `OPENAI_API_KEY`
- `LINE_API`

### 3. 定数の確認（`Config.js`）

環境に合わせて以下を確認・変更してください。

- `DIARY_DB_ID`: 日記を書き込む Notion DB ID
- `DIARY_TITLE_PROPERTY`: 日記DBのタイトル列名
- `OPENAI_SUMMARY_SYSTEM_PROMPT`: 要約プロンプト
- `DIARY_TIMEZONE`: タイムゾーン
- `DIARY_DATE_FORMAT`: タイトル日付フォーマット

### 4. clasp で反映（任意）

```bash
clasp push
```

## 実行方法

### 手動実行

GASエディタで `_main.js` の `main()` を実行します。

### 定期実行

GASのトリガー設定で `main` を時間主導トリガーに登録します（例: 毎日1回）。

## ログと通知

- 各処理は `Logger.log` でステップログを出力
- 失敗時は `_main.js` で例外を捕捉して `send2Line()` を実行
- LINE通知に失敗した場合もログへ出力

## よくあるエラー

### Notion 400: `Name is not a property that exists`

- `DIARY_TITLE_PROPERTY` が実際のDBタイトル列名と一致していません。

### Notion 403: `Insufficient permissions for this endpoint`

- Integration に書き込み権限がない、または対象DBに接続されていません。

### Script Properties 未設定

- `Config.js` の初期化時に `スクリプトプロパティが未設定です: <KEY>` が発生します。
- 対象キーを Script Properties に追加してください。
