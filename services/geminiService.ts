import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateProductDescription = async (
  name: string,
  category: string,
  metalType: string,
  weight: number,
  gemstones: string
): Promise<string> => {
  if (!apiKey) return "API Key not configured.";

  try {
    const prompt = `Write a luxurious, marketing-focused product description for a jewelry item.
    Item: ${name}
    Category: ${category}
    Material: ${metalType}
    Weight: ${weight}g
    Gemstones: ${gemstones}
    
    Keep it under 60 words. Emphasize elegance and craftsmanship.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Description not available.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Could not generate description at this time.";
  }
};

export const generateLeadFollowUp = async (
  customerName: string,
  status: string,
  interest: string
): Promise<string> => {
  if (!apiKey) return "API Key not configured.";
  
  try {
    const prompt = `Write a polite and professional follow-up message (WhatsApp style, short) for a jewelry store client.
    Client Name: ${customerName}
    Status: ${status} (e.g., just visited, quoted, ghosted)
    Interest: ${interest}
    
    Tone: Warm, non-intrusive, luxury service. Max 2 sentences.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Message not available.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error generating message.";
  }
};