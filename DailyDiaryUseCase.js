/**
 * 日次日記作成ユースケース
 */
function executeDailyDiary() {
  const thresholdIsoString = new Date(
    Date.now() - 24 * 60 * 60 * 1000
  ).toISOString();
  const thresholdDate = new Date(thresholdIsoString);

  const pages = searchPagesUpdatedAfter(thresholdIsoString);
  Logger.log("[executeDailyDiary] 取得ページ数: " + pages.length);
  if (pages.length === 0) {
    Logger.log("[executeDailyDiary] 更新ページなし");
    return;
  }

  const newDocs = [];
  const updatedDocs = [];
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
    const pageTitle = getPageTitle(page);
    const promptInput =
      "タイトル: " +
      pageTitle +
      "\n" +
      "URL: " +
      page.url +
      "\n" +
      "\n" +
      "本文:\n" +
      content;
    const summary = summarizeTextForDiary(promptInput);
    Logger.log("[executeDailyDiary] 要約完了: pageId=" + page.id + ", length=" + summary.length);
    const item = {
      title: pageTitle,
      url: page.url,
      summary: summary
    };

    const createdTime = page.created_time ? new Date(page.created_time) : null;
    const isNewDoc = createdTime ? createdTime >= thresholdDate : false;
    if (isNewDoc) {
      newDocs.push(item);
    } else {
      updatedDocs.push(item);
    }
  });

  const totalSummaries = newDocs.length + updatedDocs.length;
  Logger.log("[executeDailyDiary] 要約件数: " + totalSummaries);
  if (totalSummaries === 0) {
    Logger.log("[executeDailyDiary] 有効な要約がないためページ作成をスキップ");
    return;
  }

  const allDocs = [].concat(newDocs).concat(updatedDocs);
  let focusText = "";
  try {
    focusText = generateDailyFocusFromItems(allDocs);
  } catch (error) {
    const errorMessage = error && error.stack ? error.stack : String(error);
    Logger.log("[executeDailyDiary] 主題生成に失敗: " + errorMessage);
    focusText = "";
  }

  const diaryDateText = formatDiaryTitle(new Date());
  const diaryPageTitle = "【" + diaryDateText + "】今日の日記";
  Logger.log("[executeDailyDiary] 日記タイトル生成: " + diaryPageTitle);
  const diaryBlocks = buildDiaryBlocks({
    pageTitle: diaryPageTitle,
    dateText: diaryDateText,
    focusText: focusText,
    newDocs: newDocs,
    updatedDocs: updatedDocs
  });

  Logger.log("[executeDailyDiary] Notionページ作成開始");
  createDiaryPage({
    title: diaryPageTitle,
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
  const parentDbId =
    page && page.parent && page.parent.database_id
      ? String(page.parent.database_id)
      : "";
  const normalizedParentDbId = parentDbId.replace(/-/g, "").toLowerCase();
  const normalizedDiaryDbId = String(DIARY_DB_ID).replace(/-/g, "").toLowerCase();
  return normalizedParentDbId && normalizedParentDbId === normalizedDiaryDbId;
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
