# LINE OA Webhook on Vercel (v2, Ready-to-Deploy)

โครงสร้างนี้พร้อมใช้งานกับ **Vercel** ทันที เป็น Webhook สำหรับ **LINE Messaging API** รองรับการยืนยันลายเซ็น (HMAC SHA256), health check, และตัวอย่างการตอบกลับ (echo + คำสั่งพื้นฐาน)

---

## โครงสร้างโฟลเดอร์
```
/
├─ api/
│  ├─ health.js           # /health สำหรับตรวจสถานะ
│  └─ line-webhook.js     # /api/line-webhook = URL สำหรับตั้งเป็น Webhook
├─ utils/
│  └─ line.js             # ฟังก์ชันช่วยส่งข้อความ reply/push + ตรวจลายเซ็น
├─ .env.example           # ตัวอย่างไฟล์ Environment variables
├─ vercel.json            # กำหนด runtime และ routing
└─ README.md
```

## ตั้งค่าใน LINE Developers
1) ไปที่ **Messaging API** ของ Channel ที่ใช้งาน
2) เปิด **Use webhook** = Enabled
3) ใส่ Webhook URL เป็น: `https://<your-vercel-domain>/api/line-webhook`
4) กด **Verify** ให้ขึ้น Success
5) เก็บค่า
   - `LINE_CHANNEL_SECRET`
   - `LINE_CHANNEL_ACCESS_TOKEN`

## Deploy ขึ้น Vercel (รวดเร็ว)
1) สร้างโปรเจ็กต์ใน Vercel แล้วอัปโหลดไฟล์ทั้งโฟลเดอร์นี้
2) ตั้งค่า Environment Variables ใน Vercel → Project Settings → **Environment Variables**
   - `LINE_CHANNEL_SECRET`
   - `LINE_CHANNEL_ACCESS_TOKEN`
   - (ไม่บังคับ) `DEFAULT_REPLY`
3) Deploy
4) นำโดเมนที่ได้ไปตั้งใน LINE Developers (Webhook URL)

## ทดสอบ
- เปิด `https://<your-vercel-domain>/health` → ต้องได้ `{"ok": true}`
- ส่งข้อความหา LINE OA → ระบบจะตอบกลับ (echo/help)

## คำสั่งตัวอย่าง
- พิมพ์ `help` → แสดงรายการคำสั่ง
- พิมพ์ `ping` → ตอบ `pong`
- ข้อความอื่น ๆ → echo กลับ พร้อม marker ว่าเป็น bot

## หมายเหตุสำคัญ
- LINE ต้องการให้เราส่ง HTTP 200 เร็วพอสมควร ฟังก์ชันนี้ตอบกลับภายใน handler เลย
- หาก Verify ไม่ผ่าน ให้ตรวจสอบค่า `LINE_CHANNEL_SECRET` และการ **คำนวณลายเซ็น** ต้องอิงจาก raw body ก่อน parse เสมอ
