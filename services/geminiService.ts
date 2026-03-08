import { GoogleGenAI, Type, Schema } from "@google/genai";
import { CampaignData } from "../types";

// --- Chat Service ---
export const createChatSession = () => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  return ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: "You are a helpful, expert marketing assistant. You are concise, professional, and creative.",
    },
  });
};

// --- Image Generation Service ---
export const generateMarketingImage = async (prompt: string, aspectRatio: '1:1' | '16:9' | '4:3' = '1:1'): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: aspectRatio,
      },
    });

    const base64ImageBytes = response.generatedImages?.[0]?.image?.imageBytes;
    if (!base64ImageBytes) {
      throw new Error("No image generated");
    }
    return `data:image/jpeg;base64,${base64ImageBytes}`;
  } catch (error) {
    console.error("Image generation failed:", error);
    throw error;
  }
};

// --- Campaign Generation Service ---
export const generateCampaignContent = async (topic: string): Promise<CampaignData> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      subject: {
        type: Type.STRING,
        description: "A catchy, high-converting email subject line.",
      },
      body: {
        type: Type.STRING,
        description: "The full email body copy in Markdown format. Use persuasive, engaging marketing language.",
      },
      imagePrompt: {
        type: Type.STRING,
        description: "A detailed visual description of an image that would perfectly accompany this email, suitable for an AI image generator.",
      },
    },
    required: ["subject", "body", "imagePrompt"],
  };

  const prompt = `Create a complete email marketing campaign for the following product/service/topic: "${topic}". 
  Return the result as a JSON object containing the subject line, the email body, and a prompt for generating a hero image.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: schema,
      // Using a high thinking budget for better creative reasoning on the campaign strategy
      thinkingConfig: { thinkingBudget: 1024 }, 
    },
  });

  const text = response.text;
  if (!text) throw new Error("No content generated");
  
  try {
    return JSON.parse(text) as CampaignData;
  } catch (e) {
    console.error("Failed to parse JSON", e);
    throw new Error("Failed to parse campaign data");
  }
};