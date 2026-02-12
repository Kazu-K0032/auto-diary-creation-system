/**
 * GASトリガーのエントリポイント
 */
function main() {
  Logger.log("[main] 開始");
  try {
    executeDailyDiary();
    Logger.log("[main] 正常終了");
  } catch (error) {
    const errorMessage = error && error.stack ? error.stack : String(error);
    Logger.log("[main] エラー発生: " + errorMessage);
    try {
      send2Line("auto-diary-creation-system でエラーが発生しました\n" + errorMessage);
      Logger.log("[main] LINE通知完了");
    } catch (lineError) {
      Logger.log("[main] LINE通知失敗: " + lineError);
    }
    throw error;
  }
}

/**
 * 24時間以内に更新されたNotionページを取得する互換ラッパー
 * @returns {Array}
 */
function getUpdatedPagesLast24h() {
  const yesterdayIsoString = new Date(
    Date.now() - 24 * 60 * 60 * 1000
  ).toISOString();
  return searchPagesUpdatedAfter(yesterdayIsoString);
}

/**
 * Notionページ本文を取得する互換ラッパー
 * @param {string} pageId
 * @returns {string}
 */
function getPageContent(pageId) {
  return fetchPageContentText(pageId);
}

/**
 * OpenAI要約関数の互換ラッパー
 * @param {string} text
 * @returns {string}
 */
function summarizeWithOpenAI(text) {
  return summarizeTextForDiary(text);
}

/**
 * summaries配列から日記ページを作成する互換ラッパー
 * @param {Array} summaries
 */
function createDiaryPageFromSummaries(summaries) {
  const diaryTitle = formatDiaryTitle(new Date());
  const diaryBlocks = buildDiaryBlocks({
    dateText: diaryTitle,
    summaries: summaries
  });

  createDiaryPage({
    title: diaryTitle,
    blocks: diaryBlocks
  });
}

/**
 * Notionヘッダー取得の互換ラッパー
 * @returns {Object}
 */
function notionHeaders() {
  return buildNotionHeaders();
}
