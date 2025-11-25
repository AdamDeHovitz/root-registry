import { NextRequest, NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { auth } from "@/lib/auth/config";
import { joinLeagueSchema } from "@/lib/validations/league";
import { findLeagueById, isLeagueMember, addUserToLeague } from "@/lib/db/queries/leagues";

/**
 * POST /api/leagues/[id]/join - Join a league with password
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    // Validate input
    const result = joinLeagueSchema.safeParse({ leagueId: id, ...body });

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.format() },
        { status: 400 }
      );
    }

    const { password } = result.data;

    // Get league
    const league = await findLeagueById(id);

    if (!league) {
      return NextResponse.json({ error: "League not found" }, { status: 404 });
    }

    // Check if already a member
    const isMember = await isLeagueMember(id, session.user.id);

    if (isMember) {
      return NextResponse.json({ error: "Already a member of this league" }, { status: 400 });
    }

    // Verify password
    const isValidPassword = await compare(password, league.passwordHash);

    if (!isValidPassword) {
      return NextResponse.json({ error: "Invalid league password" }, { status: 401 });
    }

    // Add user to league
    await addUserToLeague(id, session.user.id);

    return NextResponse.json({
      message: "Successfully joined league",
      league: {
        id: league.id,
        name: league.name,
      },
    });
  } catch (error) {
    console.error("Join league error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
