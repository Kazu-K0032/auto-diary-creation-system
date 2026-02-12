/**
 * スクリプトプロパティから必須値を取得する
 * @param {string} key
 * @returns {string}
 */
function getRequiredScriptProperty(key) {
  const value = PropertiesService.getScriptProperties().getProperty(key);
  if (!value) {
    throw new Error("スクリプトプロパティが未設定です: " + key);
  }
  return value;
}

/**
 * Notion APIトークン
 * @type {string}
 */
const NOTION_TOKEN = getRequiredScriptProperty("NOTION_TOKEN");

/**
 * Notion APIバージョン
 * @type {string}
 */
const NOTION_VERSION = "2022-06-28";

/**
 * 日記を書き込むNotionデータベースID
 * @type {string}
 */
const DIARY_DB_ID = "305e35201110808d8d96c11e2fb90a9e";

/**
 * 日記DBのタイトルプロパティ名
 * @type {string}
 */
const DIARY_TITLE_PROPERTY = "ドキュメント";

/**
 * OpenAI APIキー
 * @type {string}
 */
const OPENAI_API_KEY = getRequiredScriptProperty("OPENAI_API_KEY");

/**
 * OpenAI APIモデル
 * @type {string}
 */
const OPENAI_MODEL = "gpt-4o";

/**
 * OpenAIに渡す要約システムプロンプト
 * @type {string}
 */
const OPENAI_SUMMARY_SYSTEM_PROMPT =
  "あなたは日本語の日記作成アシスタントです。\n" +
  "以下のNotionページ（タイトル/URL/本文）を、日記に貼れる形で要約してください。\n" +
  "\n" +
  "要件:\n" +
  "- 2〜4文（最大200文字目安）\n" +
  "- 何をしたか/決めたか/得られた結果を優先して書く\n" +
  "- 固有名詞・数値・期限・URLは可能な限り残す\n" +
  "- 推測しない。不明な点は「不明」と明記する\n" +
  "- 出力はプレーンテキストのみ（見出し/箇条書き/引用/Markdown/コードブロック/改行は使わない）";

/**
 * OpenAIに渡す「今日の主題（学習/思考の中心）」生成プロンプト
 * @type {string}
 */
const OPENAI_DAILY_FOCUS_SYSTEM_PROMPT =
  "あなたは日本語の日記作成アシスタントです。\n" +
  "入力として渡される複数ドキュメントの要約（タイトルと要約文）を材料に、\n" +
  "「今日は何を主に学習・考えていたか」を分析・推論して短い文章にまとめてください。\n" +
  "\n" +
  "要件:\n" +
  "- 260〜340文字程度（目安300文字）\n" +
  "- 具体的なトピック名や論点を含め、因果（なぜ/どういう狙い）も1つ入れる\n" +
  "- 入力にない事実は断定しない（推測する場合は推測と分かる表現にする）\n" +
  "- 出力はプレーンテキスト1段落のみ（見出し/箇条書き/引用/Markdown/改行は使わない）";

/**
 * LINE Messaging APIチャネルアクセストークン
 * @type {string}
 */
const LINE_API = getRequiredScriptProperty("LINE_API");

/**
 * 日付フォーマット時に使うタイムゾーン
 * @type {string}
 */
const DIARY_TIMEZONE = "Asia/Tokyo";

/**
 * 日記タイトルの日付フォーマット
 * @type {string}
 */
const DIARY_DATE_FORMAT = "yyyy年M月d日";
