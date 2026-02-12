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
 * OpenAIに渡す要約システムプロンプト
 * @type {string}
 */
const OPENAI_SUMMARY_SYSTEM_PROMPT = "以下の内容を日記向けに簡潔に要約してください";

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
const DIARY_DATE_FORMAT = "yyyyMMdd";
