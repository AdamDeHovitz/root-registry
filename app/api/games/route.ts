import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { createGameSchema } from "@/lib/validations/game";
import { createGame } from "@/lib/db/queries/games";
import { isLeagueMember } from "@/lib/db/queries/leagues";

/**
 * POST /api/games - Create new game
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Validate input
    const result = createGameSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.format() },
        { status: 400 }
      );
    }

    const { leagueId, date, map, players } = result.data;

    // Check if user is a member of the league
    const isMember = await isLeagueMember(leagueId, session.user.id);

    if (!isMember) {
      return NextResponse.json(
        { error: "You must be a member of this league to add games" },
        { status: 403 }
      );
    }

    // Check if the current user is one of the players
    const userIsPlayer = players.some(
      (p) => p.userId === session.user.id || p.playerName === session.user.username
    );

    if (!userIsPlayer) {
      return NextResponse.json(
        { error: "You must be a participant in the game to record it" },
        { status: 400 }
      );
    }

    // Create game with players
    const game = await createGame(
      {
        leagueId,
        date,
        map,
        entryMethod: "manual",
        createdBy: session.user.id,
      },
      players.map((p) => ({
        playerName: p.playerName,
        userId: p.userId,
        faction: p.faction,
        score: p.score,
        isWinner: p.isWinner,
        isDominance: p.isDominance,
        order: p.order,
      }))
    );

    return NextResponse.json(
      {
        message: "Game created successfully",
        game: {
          id: game.id,
          leagueId: game.leagueId,
          date: game.date,
          map: game.map,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create game error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
