/**
 * 日付文字列を日記タイトル用にフォーマット
 * @param {Date} date
 * @returns {string}
 */
function formatDiaryTitle(date) {
  return Utilities.formatDate(date, DIARY_TIMEZONE, DIARY_DATE_FORMAT);
}

/**
 * 日記ページ用のNotionブロックを生成
 * @param {{ pageTitle: string, dateText: string, focusText: string, newDocs: Array, updatedDocs: Array }} params
 * @returns {Array}
 */
function buildDiaryBlocks(params) {
  const blocks = [];

  blocks.push({
    object: "block",
    type: "heading_1",
    heading_1: {
      rich_text: [{ type: "text", text: { content: params.pageTitle } }]
    }
  });

  blocks.push({
    object: "block",
    type: "heading_2",
    heading_2: {
      rich_text: [{ type: "text", text: { content: "日記" } }]
    }
  });

  blocks.push({
    object: "block",
    type: "heading_2",
    heading_2: {
      rich_text: [{ type: "text", text: { content: "Notionドキュメント" } }]
    }
  });

  // Notionドキュメント直下に、今日の主題（約300文字）を挿入
  if (params.focusText) {
    blocks.push({
      object: "block",
      type: "paragraph",
      paragraph: {
        rich_text: [{ type: "text", text: { content: params.focusText } }]
      }
    });
  }

  // format.md の「xxx(Notionのデータからしたことを要約)」欄
  // 主題のあとに、各ドキュメントの要約（タイトル＋要約）を配置する
  const allDocs = []
    .concat(params.newDocs || [])
    .concat(params.updatedDocs || []);
  if (allDocs.length > 0) {
    allDocs.forEach(item => {
      blocks.push({
        object: "block",
        type: "bulleted_list_item",
        bulleted_list_item: {
          rich_text: [
            { type: "text", text: { content: item.title + ": " + item.summary } }
          ]
        }
      });
    });
  }

  blocks.push({
    object: "block",
    type: "heading_3",
    heading_3: {
      rich_text: [{ type: "text", text: { content: "新規作成ドキュメント" } }]
    }
  });

  if (!params.newDocs || params.newDocs.length === 0) {
    blocks.push({
      object: "block",
      type: "paragraph",
      paragraph: {
        rich_text: [{ type: "text", text: { content: "（なし）" } }]
      }
    });
  } else {
    params.newDocs.forEach(item => {
      blocks.push({
        object: "block",
        type: "bulleted_list_item",
        bulleted_list_item: {
          rich_text: [
            { type: "text", text: { content: item.title + ": " } },
            {
              type: "text",
              text: {
                content: item.url,
                link: { url: item.url }
              }
            }
          ]
        }
      });
    });
  }

  blocks.push({
    object: "block",
    type: "heading_3",
    heading_3: {
      rich_text: [{ type: "text", text: { content: "更新ドキュメント" } }]
    }
  });

  if (!params.updatedDocs || params.updatedDocs.length === 0) {
    blocks.push({
      object: "block",
      type: "paragraph",
      paragraph: {
        rich_text: [{ type: "text", text: { content: "（なし）" } }]
      }
    });
  } else {
    params.updatedDocs.forEach(item => {
      blocks.push({
        object: "block",
        type: "bulleted_list_item",
        bulleted_list_item: {
          rich_text: [
            { type: "text", text: { content: item.title + ": " } },
            {
              type: "text",
              text: {
                content: item.url,
                link: { url: item.url }
              }
            }
          ]
        }
      });
    });
  }

  return blocks;
}
