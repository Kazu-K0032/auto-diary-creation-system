/**
 * OpenAIで日記向けに要約
 * @param {string} text
 * @returns {string}
 */
function summarizeTextForDiary(text) {
  Logger.log("[OpenAiGateway.summarizeTextForDiary] リクエスト送信: textLength=" + text.length);
  const body = {
    model: OPENAI_MODEL,
    messages: [
      {
        role: "system",
        content: OPENAI_SUMMARY_SYSTEM_PROMPT
      },
      {
        role: "user",
        content: text
      }
    ]
  };

  const response = UrlFetchApp.fetch(
    "https://api.openai.com/v1/chat/completions",
    {
      method: "post",
      headers: {
        Authorization: "Bearer " + OPENAI_API_KEY,
        "Content-Type": "application/json"
      },
      payload: JSON.stringify(body)
    }
  );

  const summary = JSON.parse(response.getContentText()).choices[0].message.content;
  Logger.log(
    "[OpenAiGateway.summarizeTextForDiary] 要約生成完了: summaryLength=" + summary.length
  );
  return summary;
}

/**
 * 複数ドキュメントから「今日の主題（学習/思考の中心）」を生成
 * @param {Array<{title: string, summary: string}>} items
 * @returns {string}
 */
function generateDailyFocusFromItems(items) {
  const safeItems = items || [];
  const joined = safeItems
    .map(item => {
      const title = item && item.title ? String(item.title) : "無題";
      const summary = item && item.summary ? String(item.summary) : "";
      return "- " + title + ": " + summary;
    })
    .join("\n");

  const prompt = ("以下は今日のNotion更新の要約一覧です。\n\n" + joined).substring(
    0,
    6000
  );

  Logger.log(
    "[OpenAiGateway.generateDailyFocusFromItems] リクエスト送信: items=" +
      safeItems.length +
      ", textLength=" +
      prompt.length
  );

  const body = {
    model: OPENAI_MODEL,
    messages: [
      {
        role: "system",
        content: OPENAI_DAILY_FOCUS_SYSTEM_PROMPT
      },
      {
        role: "user",
        content: prompt
      }
    ]
  };

  const response = UrlFetchApp.fetch(
    "https://api.openai.com/v1/chat/completions",
    {
      method: "post",
      headers: {
        Authorization: "Bearer " + OPENAI_API_KEY,
        "Content-Type": "application/json"
      },
      payload: JSON.stringify(body)
    }
  );

  const text = JSON.parse(response.getContentText()).choices[0].message.content;
  const focus = text ? String(text).replace(/\s+/g, " ").trim() : "";
  Logger.log(
    "[OpenAiGateway.generateDailyFocusFromItems] 生成完了: focusLength=" + focus.length
  );
  return focus;
}
