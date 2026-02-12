/**
 * OpenAIで日記向けに要約
 * @param {string} text
 * @returns {string}
 */
function summarizeTextForDiary(text) {
  Logger.log("[OpenAiGateway.summarizeTextForDiary] リクエスト送信: textLength=" + text.length);
  const body = {
    model: "gpt-4o-mini",
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
