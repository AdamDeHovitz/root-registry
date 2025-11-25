import { auth } from "@/lib/auth/config";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Welcome back, {session?.user.username}!</h1>
        <p className="text-muted-foreground">Track your woodland battles and league standings</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Leagues</CardTitle>
            <CardDescription>Join or create leagues to track games</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button asChild className="w-full">
                <Link href="/leagues/new">Create League</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/leagues">Browse Leagues</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Games</CardTitle>
            <CardDescription>Record your recent matches</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full" disabled>
              <Link href="/games/new">Add Game</Link>
            </Button>
            <p className="mt-2 text-xs text-muted-foreground">
              Join a league first to record games
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Stats</CardTitle>
            <CardDescription>View your performance analytics</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full" disabled>
              <Link href="/stats">View Stats</Link>
            </Button>
            <p className="mt-2 text-xs text-muted-foreground">Play games to see stats</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest games and league updates</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No recent activity. Create or join a league to get started!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
