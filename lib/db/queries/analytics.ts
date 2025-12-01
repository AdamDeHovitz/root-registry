import { db } from "../client";
import { games, gamePlayers, users, leagueMemberships } from "../schema";
import { eq, and, isNull, sql, desc } from "drizzle-orm";

/**
 * Player statistics for a league
 */
export interface PlayerStats {
  playerName: string;
  userId: string | null;
  gamesPlayed: number;
  wins: number;
  winRate: number;
  dominanceWins: number;
  averageScore: number;
  favoredFactions: { faction: string; count: number }[];
}

/**
 * Faction statistics
 */
export interface FactionStats {
  faction: string;
  timesPlayed: number;
  wins: number;
  winRate: number;
  averageScore: number;
}

/**
 * Map statistics
 */
export interface MapStats {
  map: string;
  timesPlayed: number;
  percentage: number;
}

/**
 * Head-to-head record between two players
 */
export interface HeadToHeadRecord {
  player1Name: string;
  player2Name: string;
  player1Wins: number;
  player2Wins: number;
  totalGames: number;
}

/**
 * League analytics summary
 */
export interface LeagueAnalytics {
  totalGames: number;
  totalPlayers: number;
  playerStats: PlayerStats[];
  factionStats: FactionStats[];
  mapStats: MapStats[];
  recentGames: number;
}

/**
 * Get comprehensive analytics for a league
 */
export async function getLeagueAnalytics(leagueId: string): Promise<LeagueAnalytics> {
  // Get total games in the league
  const leagueGames = await db
    .select()
    .from(games)
    .where(eq(games.leagueId, leagueId));

  const totalGames = leagueGames.length;

  // Get all game players for this league
  const gameIds = leagueGames.map(g => g.id);

  if (gameIds.length === 0) {
    return {
      totalGames: 0,
      totalPlayers: 0,
      playerStats: [],
      factionStats: [],
      mapStats: [],
      recentGames: 0,
    };
  }

  const allPlayers = await db
    .select()
    .from(gamePlayers)
    .where(sql`${gamePlayers.gameId} IN ${gameIds}`);

  // Calculate player stats
  const playerMap = new Map<string, {
    playerName: string;
    userId: string | null;
    games: number;
    wins: number;
    dominanceWins: number;
    scores: number[];
    factions: Map<string, number>;
  }>();

  for (const player of allPlayers) {
    const key = player.userId || player.playerName;
    const existing = playerMap.get(key);

    if (existing) {
      existing.games++;
      if (player.isWinner) existing.wins++;
      if (player.isDominance) existing.dominanceWins++;
      if (player.score !== null) existing.scores.push(player.score);
      existing.factions.set(
        player.faction,
        (existing.factions.get(player.faction) || 0) + 1
      );
    } else {
      playerMap.set(key, {
        playerName: player.playerName,
        userId: player.userId,
        games: 1,
        wins: player.isWinner ? 1 : 0,
        dominanceWins: player.isDominance ? 1 : 0,
        scores: player.score !== null ? [player.score] : [],
        factions: new Map([[player.faction, 1]]),
      });
    }
  }

  const playerStats: PlayerStats[] = Array.from(playerMap.values()).map(p => ({
    playerName: p.playerName,
    userId: p.userId,
    gamesPlayed: p.games,
    wins: p.wins,
    winRate: p.games > 0 ? (p.wins / p.games) * 100 : 0,
    dominanceWins: p.dominanceWins,
    averageScore: p.scores.length > 0
      ? p.scores.reduce((a, b) => a + b, 0) / p.scores.length
      : 0,
    favoredFactions: Array.from(p.factions.entries())
      .map(([faction, count]) => ({ faction, count }))
      .sort((a, b) => b.count - a.count),
  })).sort((a, b) => b.winRate - a.winRate);

  // Calculate faction stats
  const factionMap = new Map<string, {
    played: number;
    wins: number;
    scores: number[];
  }>();

  for (const player of allPlayers) {
    const existing = factionMap.get(player.faction);
    if (existing) {
      existing.played++;
      if (player.isWinner) existing.wins++;
      if (player.score !== null) existing.scores.push(player.score);
    } else {
      factionMap.set(player.faction, {
        played: 1,
        wins: player.isWinner ? 1 : 0,
        scores: player.score !== null ? [player.score] : [],
      });
    }
  }

  const factionStats: FactionStats[] = Array.from(factionMap.entries()).map(([faction, stats]) => ({
    faction,
    timesPlayed: stats.played,
    wins: stats.wins,
    winRate: stats.played > 0 ? (stats.wins / stats.played) * 100 : 0,
    averageScore: stats.scores.length > 0
      ? stats.scores.reduce((a, b) => a + b, 0) / stats.scores.length
      : 0,
  })).sort((a, b) => b.timesPlayed - a.timesPlayed);

  // Calculate map stats
  const mapMap = new Map<string, number>();
  for (const game of leagueGames) {
    mapMap.set(game.map, (mapMap.get(game.map) || 0) + 1);
  }

  const mapStats: MapStats[] = Array.from(mapMap.entries()).map(([map, count]) => ({
    map,
    timesPlayed: count,
    percentage: totalGames > 0 ? (count / totalGames) * 100 : 0,
  })).sort((a, b) => b.timesPlayed - a.timesPlayed);

  // Count recent games (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentGames = leagueGames.filter(g => new Date(g.date) >= thirtyDaysAgo).length;

  return {
    totalGames,
    totalPlayers: playerMap.size,
    playerStats,
    factionStats,
    mapStats,
    recentGames,
  };
}

/**
 * Get head-to-head record between two players
 */
export async function getHeadToHeadRecord(
  leagueId: string,
  player1Id: string,
  player2Id: string
): Promise<HeadToHeadRecord | null> {
  // Get all games in the league where both players participated
  const leagueGames = await db
    .select()
    .from(games)
    .where(eq(games.leagueId, leagueId));

  const gameIds = leagueGames.map(g => g.id);

  if (gameIds.length === 0) {
    return null;
  }

  const allPlayers = await db
    .select()
    .from(gamePlayers)
    .where(sql`${gamePlayers.gameId} IN ${gameIds}`);

  // Group players by game
  const gamePlayerMap = new Map<string, typeof allPlayers>();
  for (const player of allPlayers) {
    const existing = gamePlayerMap.get(player.gameId);
    if (existing) {
      existing.push(player);
    } else {
      gamePlayerMap.set(player.gameId, [player]);
    }
  }

  let player1Name = "";
  let player2Name = "";
  let player1Wins = 0;
  let player2Wins = 0;
  let totalGames = 0;

  // Find games where both players participated
  for (const [gameId, players] of gamePlayerMap.entries()) {
    const p1 = players.find(p =>
      (p.userId && p.userId === player1Id) || p.playerName === player1Id
    );
    const p2 = players.find(p =>
      (p.userId && p.userId === player2Id) || p.playerName === player2Id
    );

    if (p1 && p2) {
      totalGames++;
      if (!player1Name) player1Name = p1.playerName;
      if (!player2Name) player2Name = p2.playerName;

      if (p1.isWinner) player1Wins++;
      if (p2.isWinner) player2Wins++;
    }
  }

  if (totalGames === 0) {
    return null;
  }

  return {
    player1Name,
    player2Name,
    player1Wins,
    player2Wins,
    totalGames,
  };
}

/**
 * Get player win streak (current and best)
 */
export async function getPlayerWinStreak(
  leagueId: string,
  playerId: string
): Promise<{ currentStreak: number; bestStreak: number }> {
  // Get all games in the league ordered by date
  const leagueGames = await db
    .select()
    .from(games)
    .where(eq(games.leagueId, leagueId))
    .orderBy(desc(games.date));

  const gameIds = leagueGames.map(g => g.id);

  if (gameIds.length === 0) {
    return { currentStreak: 0, bestStreak: 0 };
  }

  const allPlayers = await db
    .select()
    .from(gamePlayers)
    .where(sql`${gamePlayers.gameId} IN ${gameIds}`);

  // Group by game and sort by game date (most recent first)
  const gamePlayerMap = new Map<string, typeof allPlayers[0]>();
  for (const player of allPlayers) {
    if ((player.userId && player.userId === playerId) || player.playerName === playerId) {
      gamePlayerMap.set(player.gameId, player);
    }
  }

  // Calculate streaks
  let currentStreak = 0;
  let bestStreak = 0;
  let tempStreak = 0;

  for (const game of leagueGames) {
    const player = gamePlayerMap.get(game.id);
    if (player) {
      if (player.isWinner) {
        tempStreak++;
        if (currentStreak === 0 || currentStreak === tempStreak - 1) {
          currentStreak = tempStreak;
        }
        bestStreak = Math.max(bestStreak, tempStreak);
      } else {
        tempStreak = 0;
        if (currentStreak > 0) {
          currentStreak = 0;
        }
      }
    }
  }

  return { currentStreak, bestStreak };
}
