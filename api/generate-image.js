import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
    const prompt = body.prompt;
    const selectedModel = body.model || "Nano Banana";
    const aspectRatio = body.aspectRatio || "1:1";

    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Prompt is required." });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: "GEMINI_API_KEY is missing. Add it in Vercel Environment Variables."
      });
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY
    });

    const modelMap = {
      "Nano Banana": "gemini-2.5-flash-image",
      "Imagen 4": "imagen-4.0-generate-001"
    };

    const model = modelMap[selectedModel] || "gemini-2.5-flash-image";

    if (model === "imagen-4.0-generate-001") {
      const response = await ai.models.generateImages({
        model,
        prompt,
        config: {
          numberOfImages: 1,
          aspectRatio
        }
      });

      const img = response?.generatedImages?.[0]?.image?.imageBytes;

      if (!img) {
        return res.status(500).json({ error: "No image returned from Imagen 4." });
      }

      return res.status(200).json({
        image: `data:image/png;base64,${img}`
      });
    }

    const response = await ai.models.generateContent({
      model,
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }]
        }
      ]
    });

    const parts = response?.candidates?.[0]?.content?.parts || [];

    for (const part of parts) {
      if (part.inlineData?.data) {
        const mime = part.inlineData.mimeType || "image/png";
        return res.status(200).json({
          image: `data:${mime};base64,${part.inlineData.data}`
        });
      }
    }

    const text = parts.map(p => p.text).filter(Boolean).join("\n").trim();

    return res.status(500).json({
      error: text || "No image returned from Gemini."
    });

  } catch (error) {
    return res.status(500).json({
      error: error?.message || "Google AI Studio server error."
    });
  }
}
