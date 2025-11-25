import { db } from "../client";
import { games, gamePlayers, type NewGame, type NewGamePlayer } from "../schema";
import { eq, and, desc } from "drizzle-orm";

/**
 * Find game by ID with players
 */
export async function findGameById(id: string) {
  const game = await db.select().from(games).where(eq(games.id, id)).limit(1);

  if (!game[0]) return null;

  const players = await db
    .select()
    .from(gamePlayers)
    .where(eq(gamePlayers.gameId, id))
    .orderBy(gamePlayers.order);

  return {
    ...game[0],
    players,
  };
}

/**
 * Get all games for a league
 */
export async function getLeagueGames(leagueId: string) {
  const gamesData = await db
    .select()
    .from(games)
    .where(eq(games.leagueId, leagueId))
    .orderBy(desc(games.date));

  // Get players for each game
  const gamesWithPlayers = await Promise.all(
    gamesData.map(async (game) => {
      const players = await db
        .select()
        .from(gamePlayers)
        .where(eq(gamePlayers.gameId, game.id))
        .orderBy(gamePlayers.order);

      return {
        ...game,
        players,
      };
    })
  );

  return gamesWithPlayers;
}

/**
 * Create game with players
 */
export async function createGame(
  gameData: NewGame,
  playersData: Omit<NewGamePlayer, "gameId">[]
) {
  return await db.transaction(async (tx) => {
    // Create game
    const [game] = await tx.insert(games).values(gameData).returning();

    // Create players
    const players = await tx
      .insert(gamePlayers)
      .values(playersData.map((player) => ({ ...player, gameId: game.id })))
      .returning();

    return {
      ...game,
      players,
    };
  });
}

/**
 * Update game
 */
export async function updateGame(
  id: string,
  gameData: Partial<NewGame>,
  playersData?: Omit<NewGamePlayer, "gameId">[]
) {
  return await db.transaction(async (tx) => {
    // Update game
    const [game] = await tx
      .update(games)
      .set({ ...gameData, updatedAt: new Date() })
      .where(eq(games.id, id))
      .returning();

    // If players data provided, replace all players
    if (playersData) {
      // Delete existing players
      await tx.delete(gamePlayers).where(eq(gamePlayers.gameId, id));

      // Insert new players
      const players = await tx
        .insert(gamePlayers)
        .values(playersData.map((player) => ({ ...player, gameId: id })))
        .returning();

      return {
        ...game,
        players,
      };
    }

    // Otherwise just return game with existing players
    const players = await tx.select().from(gamePlayers).where(eq(gamePlayers.gameId, id));

    return {
      ...game,
      players,
    };
  });
}

/**
 * Delete game (cascade delete will handle players)
 */
export async function deleteGame(id: string) {
  await db.delete(games).where(eq(games.id, id));
}

/**
 * Check if user created the game
 */
export async function isGameCreator(gameId: string, userId: string) {
  const result = await db
    .select()
    .from(games)
    .where(and(eq(games.id, gameId), eq(games.createdBy, userId)))
    .limit(1);

  return result.length > 0;
}
