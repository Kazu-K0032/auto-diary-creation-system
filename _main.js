/**
 * GASトリガーのエントリポイント
 */
function main() {
  Logger.log("[main関数] 開始");
  try {
    executeDailyDiary();
    Logger.log("[main関数] 正常終了");
  } catch (error) {
    const errorMessage = error && error.stack ? error.stack : String(error);
    Logger.log("[main関数] エラー発生: " + errorMessage);
    try {
      send2Line("auto-diary-creation-system でエラーが発生しました\n" + errorMessage);
      Logger.log("[main関数] LINE通知完了");
    } catch (lineError) {
      Logger.log("[main関数] LINE通知失敗: " + lineError);
    }
    throw error;
  }
}

/**
 * 過去〇時間以内に更新されたNotionページを取得する互換ラッパー
 * @returns {Array}
 */
function getUpdatedPagesLast24h() {
  const yesterdayIsoString = new Date(
    Date.now() - UPDATE_TIME_THRESHOLD_HOURS * 60 * 60 * 1000
  ).toISOString();
  return searchPagesUpdatedAfter(yesterdayIsoString);
}

/**
 * Notionページ本文を取得する互換ラッパー
 * @param {string} pageId 取得対象のNotionページID
 * @returns {string}
 */
function getPageContent(pageId) {
  return fetchPageContentText(pageId);
}

/**
 * OpenAI要約関数の互換ラッパー
 * @param {string} text OpenAIへ渡す入力テキスト
 * @returns {string}
 */
function summarizeWithOpenAI(text) {
  return summarizeTextForDiary(text);
}

/**
 * summaries配列から日記ページを作成する互換ラッパー
 * @param {Array} summaries 日記に含める要約一覧（各要素にtitle/url/summaryを含む想定）
 */
function createDiaryPageFromSummaries(summaries) {
  const diaryDateText = formatDiaryTitle(new Date());
  const diaryPageTitle = "【" + diaryDateText + "】今日の日記";
  const diaryBlocks = buildDiaryBlocks({
    pageTitle: diaryPageTitle,
    dateText: diaryDateText,
    focusText: "",
    newDocs: [],
    updatedDocs: summaries || []
  });

  createDiaryPage({
    title: diaryPageTitle,
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
