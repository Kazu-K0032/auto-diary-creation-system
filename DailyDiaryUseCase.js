/**
 * 日次日記作成ユースケース
 */
function executeDailyDiary() {
  const yesterdayIsoString = new Date(
    Date.now() - 24 * 60 * 60 * 1000
  ).toISOString();

  const pages = searchPagesUpdatedAfter(yesterdayIsoString);
  Logger.log("[executeDailyDiary] 取得ページ数: " + pages.length);
  if (pages.length === 0) {
    Logger.log("[executeDailyDiary] 更新ページなし");
    return;
  }

  const summaries = [];
  pages.forEach(page => {
    if (isDiaryDatabasePage(page)) {
      return;
    }

    const content = fetchPageContentText(page.id);
    Logger.log("[executeDailyDiary] 本文取得完了: pageId=" + page.id + ", length=" + content.length);
    if (!content) {
      return;
    }

    Logger.log("[executeDailyDiary] 要約開始: pageId=" + page.id);
    const summary = summarizeTextForDiary(content);
    Logger.log("[executeDailyDiary] 要約完了: pageId=" + page.id + ", length=" + summary.length);
    summaries.push({
      title: getPageTitle(page),
      url: page.url,
      summary: summary
    });
  });

  Logger.log("[executeDailyDiary] 要約件数: " + summaries.length);
  if (summaries.length === 0) {
    Logger.log("[executeDailyDiary] 有効な要約がないためページ作成をスキップ");
    return;
  }

  const diaryTitle = formatDiaryTitle(new Date());
  Logger.log("[executeDailyDiary] 日記タイトル生成: " + diaryTitle);
  const diaryBlocks = buildDiaryBlocks({
    dateText: diaryTitle,
    summaries: summaries
  });

  Logger.log("[executeDailyDiary] Notionページ作成開始");
  createDiaryPage({
    title: diaryTitle,
    blocks: diaryBlocks
  });
  Logger.log("[executeDailyDiary] Notionページ作成完了");
}

/**
 * 指定ページが日記DBに属するか判定する
 * @param {Object} page
 * @returns {boolean}
 */
function isDiaryDatabasePage(page) {
  return page.parent && page.parent.database_id === DIARY_DB_ID;
}

/**
 * Notionページオブジェクトからタイトル文字列を取得する
 * @param {Object} page
 * @returns {string}
 */
function getPageTitle(page) {
  const prop = Object.values(page.properties || {}).find(p => p.type === "title");
  return prop && prop.title && prop.title[0] ? prop.title[0].plain_text : "無題";
}
