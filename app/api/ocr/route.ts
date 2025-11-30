import { NextRequest, NextResponse } from "next/server";
import { processImageWithGemini } from "@/lib/ocr/gemini-vision";

/**
 * POST /api/ocr - Process image with Gemini Vision API
 */
export async function POST(req: NextRequest) {
  try {
    const { image, mimeType } = await req.json();

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // Process with Gemini Vision
    const result = await processImageWithGemini(image, mimeType);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "OCR processing failed", rawResponse: result.rawResponse },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error("OCR API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
