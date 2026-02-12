/**
 * LINEに通知する関数
 * @param {string} body - 通知する本文内容
 */
function send2Line(body) {
    Logger.log("[Line.send2Line] リクエスト送信: messageLength=" + body.length);
    const token = LINE_API;

    const endpoint = 'https://api.line.me/v2/bot/message/broadcast';
    const payload = {
        messages: [
            { type: 'text', text: body }
        ]
    };

    const options = {
        method: "post",
        contentType: "application/json",
        payload: JSON.stringify(payload),
        headers: { Authorization: "Bearer " + token },
        muteHttpExceptions: true
    };

    const response = UrlFetchApp.fetch(endpoint, options);
    const code = response.getResponseCode();
    if (code < 200 || code >= 300) {
        Logger.log("[Line.send2Line] 送信失敗: " + response.getContentText());
    } else {
        Logger.log("[Line.send2Line] 送信成功");
    }
}

/**
 * LINE通知の疎通確認用関数
 */
function test() {
    send2Line("test");
}
