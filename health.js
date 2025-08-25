export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  return res.status(200).send(JSON.stringify({ ok: true }));
}
