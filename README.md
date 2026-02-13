# auto-diary-creation-system

[English](./docs/lang/en.md) | 日本語

## 概要

過去24時間以内で行われたNotionの新規・更新ドキュメントを収集し、その日の学習や考えたことを日記としてNotionの日記データベースに作成するシステム

## 背景

私は日々、Notionでドキュメントを作成している。ドキュメントの内容は、技術学習・日記やTodo・自己分析・旅行プランなど様々である。広い領域で作成しているドキュメントを中心に日記をつけることで、手動で日記を書かずとも日記を書く本質的な「過去の思い出しのきっかけ」を作れると考えた。

## 主な処理の流れ

1. 過去24時間で新規作成・更新されたNotionドキュメントを取得
2. 各ページ本文を抽出してOpenAIで要約
3. 要約内容をフォーマットに沿って整形
    - フォーマット: `docs/diary-format/format.md`
    - 日記の例: `docs/diary-format/format-ex.md`
4. 内容をNotionの日記データベースにドキュメントとして追加（システムはここで終了）
5. 処理中にエラーが発生した時はLINEへ通知

## セットアップ

### 1. Notion 側の準備

1. Notionインテグレーションを作成
    - 内部インテグレーションシークレットを取得
    - 機能は「コンテンツを読み取る」「コンテンツを挿入」にチェック
    - 「アクセス」タブから読み取りたいデータベースまたはトップレベルのページを選択する(トップレベルページの場合は内部のDBなど再帰的に読み取ってくれるのでおすすめ)
2. 日記DBの用意
    - 作成していない場合は作成
    - ドキュメントを作成するカラムの名前を取得し、`DIARY_TITLE_PROPERTY`に設定する(デフォルトは`ドキュメント`)

### 2. Script Properties の設定

GASエディタの「プロジェクトの設定 > スクリプト プロパティ」に以下を登録します。

- `NOTION_TOKEN`: 内部インテグレーションシークレット
- `OPENAI_API_KEY`: OpenAI API
- `LINE_API`: Messaging API(チャネルアクセストークン)

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

GASエディタで `_main.js` の `main()` を実行する

### 定期実行

GASのトリガー設定で `main` を時間主導トリガーに登録（例: 毎日1回）

## ログと通知

- 各処理は `Logger.log` でステップログを出力
- 失敗時は `_main.js` で例外を捕捉して `send2Line()` を実行
- LINE通知に失敗した場合もログへ出力

## よくあるエラー

### Notion 400: `Name is not a property that exists`

- `DIARY_TITLE_PROPERTY` が実際のDBタイトル列名と一致していないのが原因
- 日記DBで設定している実際のカラム名に変更する

### Notion 403: `Insufficient permissions for this endpoint`

- Integration に書き込み権限がない、または対象DBに接続されていないのが原因
- Notionインテグレーションに書き込み権限が追加されているか確認する。また日記DBのIDがシステムと合致しているか確認

### Script Properties 未設定

- `Config.js`の初期化時に`スクリプトプロパティが未設定です: <KEY>`が発生するケース
- 対象キーをScript Propertiesに追加すること
