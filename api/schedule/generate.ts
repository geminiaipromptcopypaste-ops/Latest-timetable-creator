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
    const { prompt, config, currentEvents } = req.body || {};
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const daysCount = config?.daysCount || 7;
    const gridStartTime = config?.startTime || 480;
    const gridEndTime = config?.endTime || 1140;

    const response = await getAi().models.generateContent({
      model: "gemini-2.5-flash",
      contents: `You are an expert academic schedule generator. Generate a list of weekly schedule events based on the user request.
User Prompt: "${prompt}"

Context rules:
- Day integers represent: 0 = Monday, 1 = Tuesday, 2 = Wednesday, 3 = Thursday, 4 = Friday, 5 = Saturday, 6 = Sunday. The max day integer allowed is ${daysCount - 1} based on daysCount limit.
- Start and end times are represented as minutes from midnight. E.g. 8:00 AM is 480, 9:00 AM is 540, 10:30 AM is 630.
- All times must fit inside the active grid boundary: ${gridStartTime} to ${gridEndTime} (minutes from midnight).
- Make sure end times are strictly greater than start times.
- Ensure events do not overlap with each other, nor with the existing schedule events unless necessary or requested.
- If currentEvents are provided, you can optionally integrate with them:
Current Schedule Events: ${JSON.stringify(currentEvents || [])}

Pick a color for each event from this standard list:
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
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "Short title of the event" },
              subject: { type: Type.STRING, description: "Name of the subject" },
              teacher: { type: Type.STRING, description: "Teacher or instructor" },
              room: { type: Type.STRING, description: "Room number or name" },
              location: { type: Type.STRING, description: "Location details" },
              category: { type: Type.STRING, description: "e.g. Lecture, Meeting, Lab" },
              notes: { type: Type.STRING, description: "Brief notes" },
              day: { type: Type.INTEGER, description: "Day index (0 to " + (daysCount - 1) + ")" },
              startTime: { type: Type.INTEGER, description: "Start time in minutes from midnight" },
              endTime: { type: Type.INTEGER, description: "End time in minutes from midnight" },
              color: { type: Type.STRING, description: "One hex color string from the allowed list" },
            },
            required: ["title", "subject", "teacher", "room", "location", "category", "notes", "day", "startTime", "endTime", "color"],
          },
        },
      },
    });

    const result = JSON.parse(response.text?.trim() || "[]");
    return res.status(200).json(result);
  } catch (error: any) {
    console.error("Vercel AI Generation error:", error);
    return res.status(500).json({ error: error.message || "Failed to generate schedule events." });
  }
}
