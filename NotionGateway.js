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
 * @param {string} isoDateString
 * @returns {Array}
 */
function searchPagesUpdatedAfter(isoDateString) {
  const body = {
    filter: {
      property: "object",
      value: "page"
    }
  };

  const response = UrlFetchApp.fetch("https://api.notion.com/v1/search", {
    method: "post",
    headers: buildNotionHeaders(),
    payload: JSON.stringify(body)
  });

  const results = JSON.parse(response.getContentText()).results || [];
  const threshold = new Date(isoDateString);
  const filtered = results.filter(page => {
    if (!page || !page.last_edited_time) return false;
    return new Date(page.last_edited_time) >= threshold;
  });
  Logger.log(
    "[NotionGateway.searchPagesUpdatedAfter] 条件一致ページ数: " + filtered.length
  );
  return filtered;
}

/**
 * ページの子ブロックを取得
 * @param {string} pageId
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
 * ページ本文をプレーンテキストとして取得（最大1000文字）
 * @param {string} pageId
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

  const content = text.substring(0, 1000);
  return content;
}

/**
 * 日記DBにページを作成
 * @param {{ title: string, blocks: Array }} params
 */
function createDiaryPage(params) {
  Logger.log(
    "[NotionGateway.createDiaryPage] リクエスト送信: title=" +
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

  const response = UrlFetchApp.fetch("https://api.notion.com/v1/pages", {
    method: "post",
    headers: buildNotionHeaders(),
    payload: JSON.stringify(body)
  });
  Logger.log(
    "[NotionGateway.createDiaryPage] レスポンス受信: status=" + response.getResponseCode()
  );
}
