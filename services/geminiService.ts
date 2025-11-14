
import { GoogleGenAI } from "@google/genai";
import type { OutputPayload } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // This is a placeholder check. The environment is expected to have the API key.
  console.warn("API_KEY environment variable not set. API calls will fail.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

// Helper function to extract JSON from the model's text response
const extractJson = (text: string): object | null => {
  const match = text.match(/```json\n([\s\S]*?)\n```|({[\s\S]*})/);
  if (!match) {
    console.error("No JSON found in the response text.");
    return null;
  }
  try {
    // Prefer the first captured group (markdown block), fallback to the second (raw object)
    return JSON.parse(match[1] || match[2]);
  } catch (error) {
    console.error("Failed to parse JSON from response:", error);
    return null;
  }
};

export const getBotResponse = async (prompt: string): Promise<OutputPayload | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    const responseText = response.text;
    if (!responseText) {
      throw new Error("API returned an empty response text.");
    }

    // The model is instructed to return a valid JSON string directly.
    // The `extractJson` is a fallback for cases where it might wrap it in markdown.
    let parsedResponse;
    try {
        parsedResponse = JSON.parse(responseText);
    } catch (e) {
        console.warn("Direct JSON parsing failed, attempting to extract from markdown.");
        parsedResponse = extractJson(responseText);
    }

    if (!parsedResponse) {
      throw new Error("Could not parse a valid JSON object from the API response.");
    }
    
    // Basic validation to ensure the response object has the expected shape
    if ('resposta_usuario' in parsedResponse && 'proximo_estado' in parsedResponse) {
        return parsedResponse as OutputPayload;
    } else {
        throw new Error("Parsed JSON does not match the expected OutputPayload structure.");
    }

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        throw new Error(`Gemini API Error: ${error.message}`);
    }
    throw new Error("An unknown error occurred while contacting the Gemini API.");
  }
};
