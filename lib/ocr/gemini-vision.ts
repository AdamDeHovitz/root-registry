/**
 * Gemini Vision API service for Root score screen OCR
 */

import { generateVisionPrompt, validateVisionResponse, type VisionOCRResponse } from "./vision-prompt";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

export interface GeminiVisionResult {
  success: boolean;
  data?: VisionOCRResponse;
  error?: string;
  rawResponse?: string;
}

/**
 * Process an image with Gemini Vision API
 * @param imageData - Base64 encoded image data (without data:image/... prefix)
 * @param mimeType - Image MIME type (e.g., "image/png", "image/jpeg", "image/webp")
 */
export async function processImageWithGemini(
  imageData: string,
  mimeType: string = "image/png"
): Promise<GeminiVisionResult> {
  if (!GEMINI_API_KEY) {
    return {
      success: false,
      error: "Gemini API key not configured",
    };
  }

  try {
    const prompt = generateVisionPrompt();

    const requestBody = {
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: mimeType,
                data: imageData,
              },
            },
          ],
        },
      ],
    };

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      // Try to parse as JSON first, fallback to text if that fails
      let errorMessage = `API request failed: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error?.message || errorMessage;
      } catch {
        // Response is not JSON, try to get text
        try {
          const errorText = await response.text();
          if (errorText) {
            errorMessage = errorText;
          }
        } catch {
          // If both fail, use the default message
        }
      }

      return {
        success: false,
        error: errorMessage,
      };
    }

    const result = await response.json();

    // Extract the text response
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return {
        success: false,
        error: "No response text from Gemini",
        rawResponse: JSON.stringify(result),
      };
    }

    // Parse JSON from the response (Gemini returns it in markdown code blocks)
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      return {
        success: false,
        error: "Could not extract JSON from response",
        rawResponse: text,
      };
    }

    const jsonText = jsonMatch[1] || jsonMatch[0];
    let parsedData;
    try {
      parsedData = JSON.parse(jsonText);
    } catch (parseError) {
      return {
        success: false,
        error: "Failed to parse JSON response from Gemini",
        rawResponse: text,
      };
    }

    // Validate the response
    const validation = validateVisionResponse(parsedData);

    if (!validation.valid) {
      return {
        success: false,
        error: `Validation failed: ${validation.errors.join(", ")}`,
        rawResponse: text,
      };
    }

    return {
      success: true,
      data: validation.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Convert a File or Blob to base64 string
 */
export async function fileToBase64(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      // Remove the data:image/...;base64, prefix
      const base64Data = base64.split(",")[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
