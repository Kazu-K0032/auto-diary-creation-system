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
 * @param {{ dateText: string, summaries: Array }} params
 * @returns {Array}
 */
function buildDiaryBlocks(params) {
  const blocks = [];

  blocks.push({
    object: "block",
    type: "heading_1",
    heading_1: {
      rich_text: [{ type: "text", text: { content: params.dateText } }]
    }
  });

  blocks.push({
    object: "block",
    type: "heading_2",
    heading_2: {
      rich_text: [{ type: "text", text: { content: "Notion追跡" } }]
    }
  });

  params.summaries.forEach((item, index) => {
    blocks.push({
      object: "block",
      type: "heading_3",
      heading_3: {
        rich_text: [{ type: "text", text: { content: "要約" + (index + 1) } }]
      }
    });

    blocks.push({
      object: "block",
      type: "paragraph",
      paragraph: {
        rich_text: [{ type: "text", text: { content: item.summary + "\n" } }]
      }
    });

    blocks.push({
      object: "block",
      type: "paragraph",
      paragraph: {
        rich_text: [
          { type: "text", text: { content: "ドキュメント: " } },
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
  return blocks;
}
