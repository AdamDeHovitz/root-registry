import { auth } from "@/lib/auth/config";
import { findLeagueById, isLeagueAdmin, getLeagueMembers } from "@/lib/db/queries/leagues";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

export default async function LeagueDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const league = await findLeagueById(params.id);

  if (!league) {
    notFound();
  }

  const isAdmin = await isLeagueAdmin(params.id, session.user.id);
  const members = await getLeagueMembers(params.id);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="mb-2">
            <Link href="/leagues" className="text-sm text-muted-foreground hover:text-foreground">
              ← Back to Leagues
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{league.name}</h1>
            {isAdmin && (
              <span className="rounded-full bg-primary px-3 py-1 text-sm text-primary-foreground">
                Admin
              </span>
            )}
          </div>
          {league.description && <p className="mt-2 text-muted-foreground">{league.description}</p>}
        </div>
        <Button asChild>
          <Link href={`/leagues/${params.id}/games/new`}>Add Game</Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>League Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm font-medium">League ID</p>
              <div className="flex items-center gap-2">
                <code className="rounded bg-muted px-2 py-1 text-sm">{league.id}</code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigator.clipboard.writeText(league.id)}
                >
                  Copy
                </Button>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Share this ID with others to join
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Created</p>
              <p className="text-sm text-muted-foreground">
                {new Date(league.createdAt).toLocaleDateString()}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Members ({members.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {members.map(({ user, membership }) => (
                <div
                  key={membership.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="font-medium">{user?.username || "Unknown User"}</p>
                    {user?.direwolfUsername && (
                      <p className="text-xs text-muted-foreground">@{user.direwolfUsername}</p>
                    )}
                  </div>
                  {membership.isAdmin && (
                    <span className="rounded-full bg-secondary px-2 py-1 text-xs">Admin</span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Games</CardTitle>
          <CardDescription>Games played in this league</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No games recorded yet. Add your first game to get started!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
