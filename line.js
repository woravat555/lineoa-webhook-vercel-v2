import crypto from "crypto";

const LINE_API = "https://api.line.me/v2/bot";

export function verifyLineSignature(channelSecret, bodyBuffer, signatureHeader) {
  if (!channelSecret || !signatureHeader) return false;
  const hmac = crypto.createHmac("sha256", channelSecret);
  hmac.update(bodyBuffer);
  const expected = hmac.digest("base64");
  return crypto.timingSafeEqual(Buffer.from(signatureHeader), Buffer.from(expected));
}

export async function replyMessage(accessToken, replyToken, messages) {
  const resp = await fetch(`${LINE_API}/message/reply`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${accessToken}`
    },
    body: JSON.stringify({ replyToken, messages })
  });
  if (!resp.ok) {
    const text = await resp.text();
    console.error("[LINE] reply error", resp.status, text);
  }
  return resp.ok;
}

export async function pushMessage(accessToken, to, messages) {
  const resp = await fetch(`${LINE_API}/message/push`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${accessToken}`
    },
    body: JSON.stringify({ to, messages })
  });
  if (!resp.ok) {
    const text = await resp.text();
    console.error("[LINE] push error", resp.status, text);
  }
  return resp.ok;
}
