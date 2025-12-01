import { auth } from "@/lib/auth/config";
import { findLeagueById, isLeagueMember } from "@/lib/db/queries/leagues";
import { getLeagueAnalytics } from "@/lib/db/queries/analytics";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

export default async function LeagueAnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const { id } = await params;
  const league = await findLeagueById(id);

  if (!league) {
    notFound();
  }

  const isMember = await isLeagueMember(id, session.user.id);
  if (!isMember) {
    redirect("/leagues");
  }

  const analytics = await getLeagueAnalytics(id);

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-2">
          <Link href={`/leagues/${id}`} className="text-sm text-muted-foreground hover:text-foreground">
            ← Back to {league.name}
          </Link>
        </div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="mt-2 text-muted-foreground">Statistics and insights for {league.name}</p>
      </div>

      {analytics.totalGames === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              No games recorded yet. Add games to see analytics!
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Overview Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total Games</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.totalGames}</div>
                <p className="text-xs text-muted-foreground">
                  {analytics.recentGames} in last 30 days
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Active Players</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.totalPlayers}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Most Played Faction</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics.factionStats[0]?.faction || "N/A"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {analytics.factionStats[0]?.timesPlayed || 0} games
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Most Played Map</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics.mapStats[0]?.map || "N/A"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {analytics.mapStats[0]?.percentage.toFixed(1) || 0}% of games
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Player Leaderboard */}
          <Card>
            <CardHeader>
              <CardTitle>Player Leaderboard</CardTitle>
              <CardDescription>Ranked by win rate (minimum 1 game)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.playerStats.map((player, index) => (
                  <div key={`${player.userId || player.playerName}`} className="flex items-center gap-4 rounded-lg border p-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{player.playerName}</p>
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <span>{player.gamesPlayed} games</span>
                        <span>{player.wins} wins</span>
                        {player.dominanceWins > 0 && <span>{player.dominanceWins} dominance</span>}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold">{player.winRate.toFixed(1)}%</div>
                      <div className="text-xs text-muted-foreground">
                        Avg: {player.averageScore.toFixed(1)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Faction Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Faction Statistics</CardTitle>
                <CardDescription>Performance by faction</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.factionStats.slice(0, 10).map((faction) => (
                    <div key={faction.faction} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{faction.faction}</span>
                        <div className="flex gap-3 text-xs text-muted-foreground">
                          <span>{faction.timesPlayed} played</span>
                          <span>{faction.wins} wins</span>
                          <span className="font-medium text-foreground">{faction.winRate.toFixed(1)}%</span>
                        </div>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full bg-primary"
                          style={{ width: `${Math.min(faction.winRate, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Map Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Map Distribution</CardTitle>
                <CardDescription>Map popularity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.mapStats.map((map) => (
                    <div key={map.map} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{map.map}</span>
                        <div className="flex gap-3 text-xs text-muted-foreground">
                          <span>{map.timesPlayed} games</span>
                          <span className="font-medium text-foreground">{map.percentage.toFixed(1)}%</span>
                        </div>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full bg-primary"
                          style={{ width: `${map.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Favorite Factions by Player */}
          <Card>
            <CardHeader>
              <CardTitle>Player Faction Preferences</CardTitle>
              <CardDescription>Most played factions by player</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.playerStats.map((player) => (
                  <div key={`${player.userId || player.playerName}`} className="rounded-lg border p-4">
                    <p className="mb-2 font-medium">{player.playerName}</p>
                    <div className="flex flex-wrap gap-2">
                      {player.favoredFactions.slice(0, 5).map((fav) => (
                        <span
                          key={fav.faction}
                          className="rounded-full bg-secondary px-3 py-1 text-xs"
                        >
                          {fav.faction} ({fav.count})
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
