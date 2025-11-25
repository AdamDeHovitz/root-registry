import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { auth } from "@/lib/auth/config";
import { createLeagueSchema } from "@/lib/validations/league";
import { createLeague, getUserLeagues } from "@/lib/db/queries/leagues";

/**
 * GET /api/leagues - Get all leagues for current user
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const leagues = await getUserLeagues(session.user.id);

    return NextResponse.json({
      leagues: leagues.map(({ league, membership }) => ({
        ...league,
        isAdmin: membership.isAdmin,
        joinedAt: membership.joinedAt,
      })),
    });
  } catch (error) {
    console.error("Get leagues error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/leagues - Create new league
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Validate input
    const result = createLeagueSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.format() },
        { status: 400 }
      );
    }

    const { name, description, password } = result.data;

    // Hash league password
    const passwordHash = await hash(password, 12);

    // Create league with creator as admin
    const league = await createLeague({
      name,
      description: description || null,
      passwordHash,
      createdBy: session.user.id,
    });

    return NextResponse.json(
      {
        message: "League created successfully",
        league: {
          id: league.id,
          name: league.name,
          description: league.description,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create league error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
