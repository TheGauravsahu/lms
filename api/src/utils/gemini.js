import env from "../config/env.js";

/**
 * Generates content using Google Gemini model via raw fetch requests.
 * Supports chat histories and structured JSON outputs.
 * 
 * @param {string} prompt The current user message
 * @param {Array} history Optional history in shape: [{ role: "user" | "model", content: string }]
 * @param {boolean} isJson Whether to enforce structured JSON output
 * @param {string} systemInstruction Optional system priming instruction
 * @returns {Promise<string>} Gemini response text
 */
export const generateGeminiContent = async (prompt, history = [], isJson = false, systemInstruction = "") => {
  const apiKey = env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not configured in the api/.env file. Please obtain a key from Google AI Studio and update your environment variables."
    );
  }

  // Using gemini-2.5-flash for high quality, fast execution, and large context windows
  const model = "gemini-2.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  // Map database message history to Gemini API format
  const contents = [];

  for (const msg of history) {
    contents.push({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    });
  }

  // Push current prompt
  contents.push({
    role: "user",
    parts: [{ text: prompt }],
  });

  const requestBody = {
    contents,
  };

  if (systemInstruction) {
    requestBody.systemInstruction = {
      parts: [{ text: systemInstruction }],
    };
  }

  if (isJson) {
    requestBody.generationConfig = {
      responseMimeType: "application/json",
    };
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API Error (HTTP ${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("Invalid or empty response received from Gemini API.");
  }

  return text;
};
