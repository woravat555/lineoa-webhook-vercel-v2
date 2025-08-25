import { verifyLineSignature, replyMessage } from "../utils/line.js";

// Read raw body from Node.js request (required for signature verification)
async function readRawBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const channelSecret = process.env.LINE_CHANNEL_SECRET;
  const accessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  const defaultReply = process.env.DEFAULT_REPLY || "สวัสดีครับ ระบบ Woravat AI พร้อมทำงาน ✅";

  if (!channelSecret || !accessToken) {
    return res.status(500).json({ error: "Missing LINE credentials in environment" });
  }

  const signature = req.headers["x-line-signature"];
  const bodyBuffer = await readRawBody(req);

  // Verify signature against raw body
  if (!verifyLineSignature(channelSecret, bodyBuffer, signature)) {
    return res.status(401).json({ error: "Invalid signature" });
  }

  // Now parse JSON safely
  let body;
  try {
    body = JSON.parse(bodyBuffer.toString("utf-8"));
  } catch (e) {
    return res.status(400).json({ error: "Invalid JSON" });
  }

  // Process events
  const events = Array.isArray(body.events) ? body.events : [];
  const tasks = events.map(async (event) => {
    try {
      if (event.type === "message" && event.message?.type === "text") {
        const text = (event.message.text || "").trim().toLowerCase();

        if (text === "help") {
          const help = [
            "คำสั่งที่ใช้ได้:",
            "• help - แสดงรายการคำสั่ง",
            "• ping - ตอบ pong",
            "• (อื่น ๆ) - echo กลับ"
          ].join("\n");
          return replyMessage(accessToken, event.replyToken, [ { type: "text", text: help } ]);
        }

        if (text === "ping") {
          return replyMessage(accessToken, event.replyToken, [ { type: "text", text: "pong" } ]);
        }

        // Echo + marker
        const echoed = `🤖 BOT: ${event.message.text}`;
        return replyMessage(accessToken, event.replyToken, [ { type: "text", text: echoed } ]);
      }

      if (event.type === "follow") {
        return replyMessage(accessToken, event.replyToken, [ { type: "text", text: defaultReply } ]);
      }

      if (event.type === "postback") {
        const data = event.postback?.data || "";
        return replyMessage(accessToken, event.replyToken, [ { type: "text", text: `ได้รับ postback: ${data}` } ]);
      }

      // Fallback
      return replyMessage(accessToken, event.replyToken, [ { type: "text", text: defaultReply } ]);
    } catch (err) {
      console.error("Event handling error:", err);
    }
  });

  await Promise.all(tasks);
  return res.status(200).json({ ok: true });
}
