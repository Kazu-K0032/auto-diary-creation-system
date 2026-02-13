/**
 * OpenAI Chat Completions APIを呼び出し、生成テキストを返す
 * @param {string} systemPrompt システムメッセージとして渡すプロンプト
 * @param {string} userPrompt ユーザーメッセージとして渡す入力テキスト
 * @returns {string}
 */
function createChatCompletionText(systemPrompt, userPrompt) {
  const body = {
    model: OPENAI_MODEL,
    messages: [
      {
        role: "system",
        content: systemPrompt
      },
      {
        role: "user",
        content: userPrompt
      }
    ]
  };

  /** @see https://developers.openai.com/api-reference/chat/create Create chat completion */
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

  return JSON.parse(response.getContentText()).choices[0].message.content;
}

/**
 * OpenAIで日記向けに要約
 * @param {string} text OpenAIへ渡す入力テキスト
 * @returns {string}
 */
function summarizeTextForDiary(text) {
  const summary = createChatCompletionText(OPENAI_SUMMARY_SYSTEM_PROMPT, text);
  Logger.log(
    "[OpenAiGateway.summarizeTextForDiary関数] 要約生成完了: summaryLength=" +
      summary.length
  );
  return summary;
}

/**
 * 複数ドキュメントから「今日の主題（学習/思考の中心）」を生成
 * @param {Array<{title: string, summary: string}>} items ドキュメント要約の一覧（title: タイトル、summary: 要約文）
 * @returns {string}
 */
function generateDailyFocusFromItems(items) {
  const defaultTitle = "無題";
  const safeItems = items || [];
  const joined = safeItems
    .map(item => {
      const title = item && item.title ? String(item.title) : defaultTitle;
      const summary = item && item.summary ? String(item.summary) : "";
      return "- " + title + ": " + summary;
    })
    .join("\n");

  const prompt = ("以下は今日のNotion更新の要約一覧です。\n\n" + joined).substring(
    0, // 先頭から
    6000 // 最大6000文字に切り捨て(OpenAIに渡す入力テキストの上限)
  );

  const text = createChatCompletionText(OPENAI_DAILY_FOCUS_SYSTEM_PROMPT, prompt);
  const focus = text ? String(text).replace(/\s+/g, " ").trim() : "";
  Logger.log(
    "[OpenAiGateway.generateDailyFocusFromItems関数] 生成完了: focusLength=" +
      focus.length
  );
  return focus;
}
