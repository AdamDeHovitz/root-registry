import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { getAllOCRCorrections } from "@/lib/db/queries/games";

/**
 * GET /api/ocr-corrections - Get all OCR corrections
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const corrections = await getAllOCRCorrections();

    return NextResponse.json({
      corrections: corrections.map(({ correction, game }) => ({
        id: correction.id,
        gameId: correction.gameId,
        imageUrl: correction.imageUrl,
        originalData: correction.originalData,
        correctedData: correction.correctedData,
        fieldsChanged: correction.fieldsChanged,
        createdAt: correction.createdAt,
        game: game || null,
      })),
    });
  } catch (error) {
    console.error("Get OCR corrections error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
