import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { findLeagueById, isLeagueAdmin, deleteLeague } from "@/lib/db/queries/leagues";

/**
 * GET /api/leagues/[id] - Get league details
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const league = await findLeagueById(id);

    if (!league) {
      return NextResponse.json({ error: "League not found" }, { status: 404 });
    }

    // Check if user is admin
    const isAdmin = await isLeagueAdmin(id, session.user.id);

    return NextResponse.json({
      league: {
        id: league.id,
        name: league.name,
        description: league.description,
        createdAt: league.createdAt,
      },
      isAdmin,
    });
  } catch (error) {
    console.error("Get league error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * DELETE /api/leagues/[id] - Delete league (admin only)
 */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check if user is admin
    const isAdmin = await isLeagueAdmin(id, session.user.id);

    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 });
    }

    await deleteLeague(id);

    return NextResponse.json({ message: "League deleted successfully" });
  } catch (error) {
    console.error("Delete league error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
