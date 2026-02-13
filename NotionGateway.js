/**
 * Notion API通信用ヘッダー
 * @returns {Object}
 */
function buildNotionHeaders() {
  return {
    Authorization: "Bearer " + NOTION_TOKEN,
    "Notion-Version": NOTION_VERSION,
    "Content-Type": "application/json"
  };
}

/**
 * 指定日時以降に更新されたページを検索
 * @param {string} isoDateString 閾値となるISO 8601形式の日時文字列（この日時以降に更新されたページを抽出）
 * @returns {Array}
 */
function searchPagesUpdatedAfter(isoDateString) {
  const body = {
    filter: {
      property: "object",
      value: "page"
    }
  };

  /** 
   * @see https://developers.google.com/apps-script/reference/url-fetch/url-fetch-app?hl=ja Class UrlFetchApp
   * @see https://developers.notion.com/reference/post-search#search-by-title Notion APIの検索エンドポイント
   */
  const response = UrlFetchApp.fetch("https://api.notion.com/v1/search", {
    method: "post",
    headers: buildNotionHeaders(),
    payload: JSON.stringify(body)
  });

  const results = JSON.parse(response.getContentText()).results || [];
  const threshold = new Date(isoDateString);
  // 過去〇時間以内に更新されたページを取得
  const filtered = results.filter(page => {
    if (!page || !page.last_edited_time) return false;
    return new Date(page.last_edited_time) >= threshold;
  });
  return filtered;
}

/**
 * ページの子ブロックを取得
 * @param {string} pageId 取得対象のNotionページID
 * @returns {Array}
 */
function fetchPageChildren(pageId) {
  const response = UrlFetchApp.fetch(
    "https://api.notion.com/v1/blocks/" + pageId + "/children",
    {
      method: "get",
      headers: buildNotionHeaders()
    }
  );
  const results = JSON.parse(response.getContentText()).results || [];
  return results;
}

/**
 * ページ本文をプレーンテキストとして取得
 * @param {string} pageId 取得対象のNotionページID
 * @returns {string}
 */
function fetchPageContentText(pageId) {
  const blocks = fetchPageChildren(pageId);
  let text = "";
  blocks.forEach(block => {
    if (
      block.type === "paragraph" &&
      block.paragraph &&
      block.paragraph.rich_text &&
      block.paragraph.rich_text.length > 0
    ) {
      text += block.paragraph.rich_text[0].plain_text + "\n";
    }
  });

  // 最大x文字に切り捨て(本文を短く切ってOpenAIに渡すための任意の上限)
  const maxLength = 2000;
  const content = text.substring(0, maxLength);
  return content;
}

/**
 * 日記DBにページを作成
 * @param {{ title: string, blocks: Array }} params 作成する日記ページの情報（title: タイトル、blocks: Notionの子ブロック配列）
 */
function createDiaryPage(params) {
  Logger.log(
    "[NotionGateway.createDiaryPage関数] リクエスト送信: title=" +
      params.title +
      ", blocks=" +
      params.blocks.length
  );
  const body = {
    parent: { database_id: DIARY_DB_ID },
    properties: {},
    children: params.blocks
  };

  body.properties[DIARY_TITLE_PROPERTY] = {
    title: [
      {
        type: "text",
        text: { content: params.title }
      }
    ]
  };

  /** @see https://developers.notion.com/reference/post-page Notion APIのページ作成エンドポイント */
  UrlFetchApp.fetch("https://api.notion.com/v1/pages", {
    method: "post",
    headers: buildNotionHeaders(),
    payload: JSON.stringify(body)
  });
}
