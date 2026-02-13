/**
 * 日次日記作成ユースケース
 */
function executeDailyDiary() {
  // 過去〇時間以内に更新されたページを取得
  const thresholdIsoString = new Date(
    Date.now() - UPDATE_TIME_THRESHOLD_HOURS * 60 * 60 * 1000
  ).toISOString();
  const thresholdDate = new Date(thresholdIsoString);

  const pages = searchPagesUpdatedAfter(thresholdIsoString);
  Logger.log("[executeDailyDiary関数] 取得ページ数: " + pages.length);
  if (pages.length === 0) {
    Logger.log("[executeDailyDiary関数] 更新ページなし");
    return;
  }

  // 新規作成されたページを格納するリスト
  const newDocs = [];
  // 更新されたページを格納するリスト
  const updatedDocs = [];
  pages.forEach(page => {
    if (isDiaryDatabasePage(page)) {
      return;
    }

    const content = fetchPageContentText(page.id);
    Logger.log("[executeDailyDiary関数] 本文取得完了: pageId=" + page.id + ", length=" + content.length);
    if (!content) {
      return;
    }

    Logger.log("[executeDailyDiary関数] 要約開始: pageId=" + page.id);
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
    Logger.log("[executeDailyDiary関数] 要約完了: pageId=" + page.id + ", length=" + summary.length);
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
  Logger.log("[executeDailyDiary関数] 要約件数: " + totalSummaries);
  if (totalSummaries === 0) {
    Logger.log("[executeDailyDiary関数] 有効な要約がないためページ作成をスキップ");
    return;
  }

  const allDocs = [].concat(newDocs).concat(updatedDocs);
  let focusText = "";
  try {
    focusText = generateDailyFocusFromItems(allDocs);
  } catch (error) {
    const errorMessage = error && error.stack ? error.stack : String(error);
    Logger.log("[executeDailyDiary関数] 主題生成に失敗: " + errorMessage);
    focusText = "";
  }

  const diaryDateText = formatDiaryTitle(new Date());
  const diaryPageTitle = "【" + diaryDateText + "】今日の日記";
  Logger.log("[executeDailyDiary関数] 日記タイトル生成: " + diaryPageTitle);
  const diaryBlocks = buildDiaryBlocks({
    pageTitle: diaryPageTitle,
    dateText: diaryDateText,
    focusText: focusText,
    newDocs: newDocs,
    updatedDocs: updatedDocs
  });

  Logger.log("[executeDailyDiary関数] Notionページ作成開始");
  createDiaryPage({
    title: diaryPageTitle,
    blocks: diaryBlocks
  });
  Logger.log("[executeDailyDiary関数] Notionページ作成完了");
}

/**
 * 指定ページが日記DBに属するか判定する
 * @param {Object} page Notionのページオブジェクト
 * @returns {boolean}
 */
function isDiaryDatabasePage(page) {
  // ページの親データベースIDを取得
  const parentDbId =
    page && page.parent && page.parent.database_id
      ? String(page.parent.database_id)
      : "";
  // データベースIDからハイフンを削除して小文字に変換
  const normalizedParentDbId = parentDbId.replace(/-/g, "").toLowerCase();
  // 日記DBのデータベースIDからハイフンを削除して小文字に変換
  const normalizedDiaryDbId = String(DIARY_DB_ID).replace(/-/g, "").toLowerCase();
  // データベースIDが一致する場合はtrueを返す
  return normalizedParentDbId && normalizedParentDbId === normalizedDiaryDbId;
}

/**
 * Notionページオブジェクトからタイトル文字列を取得する
 * @param {Object} page Notionのページオブジェクト
 * @returns {string}
 */
function getPageTitle(page) {
  const defaultTitle = "無題";
  // ページオブジェクトが存在しない場合
  if (!page || !page.properties) {
    return defaultTitle;
  }

  // タイトル型プロパティを探す
  const propertyList = Object.values(page.properties);
  const titleProperty = propertyList.find(property => property.type === "title");

  // タイトル型プロパティが存在し、タイトルが存在する場合
  if (
    titleProperty &&
    Array.isArray(titleProperty.title) &&
    titleProperty.title.length > 0 &&
    titleProperty.title[0].plain_text
  ) {
    // タイトルを返す
    return titleProperty.title[0].plain_text;
  }

  return defaultTitle;
}
