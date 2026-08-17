import { GoogleGenAI, Type } from "@google/genai";
import { setCorsHeaders } from "../_cors.js";

let aiClient: GoogleGenAI | null = null;
function getAi(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

export default async function handler(req: any, res: any) {
  setCorsHeaders(res);

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { title, subject, teacher, room, category, notes } = req.body || {};
    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    const response = await getAi().models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Provide realistic school or work schedule details based on the event title: "${title}".
If any details are already partially filled, preserve them or enhance them:
- subject: ${subject || ''}
- teacher: ${teacher || ''}
- room: ${room || ''}
- category: ${category || ''}
- notes: ${notes || ''}

Assign a professional color from these options:
- #0d9488 (Teal/Mint)
- #10b981 (Emerald Green)
- #8b5cf6 (Violet)
- #f59e0b (Amber Orange)
- #ec4899 (Pink)
- #14b8a6 (Menthol Mint)
- #f87171 (Soft Coral Red)
- #64748b (Slate)`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            subject: { type: Type.STRING, description: "Name of the academic subject or department" },
            teacher: { type: Type.STRING, description: "Teacher, instructor, or leader name" },
            room: { type: Type.STRING, description: "Room number or name, e.g. Lab 401" },
            category: { type: Type.STRING, description: "Type of event, e.g. Lecture, Lab, Seminar, Meeting" },
            notes: { type: Type.STRING, description: "Brief notes/description of what is covered" },
            color: { type: Type.STRING, description: "One hex color string from the allowed list" },
          },
          required: ["subject", "teacher", "room", "category", "notes", "color"],
        },
      },
    });

    const result = JSON.parse(response.text?.trim() || "{}");
    return res.status(200).json(result);
  } catch (error: any) {
    console.error("Vercel AI Autocomplete error:", error);
    return res.status(500).json({ error: error.message || "Failed to autocomplete schedule event." });
  }
}
