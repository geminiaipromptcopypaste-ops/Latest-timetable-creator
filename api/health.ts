import { setCorsHeaders } from "./_cors.js";

export default function handler(req: any, res: any) {
  setCorsHeaders(res);
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  return res.status(200).json({ status: "ok" });
}
