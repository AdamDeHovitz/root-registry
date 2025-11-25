import { auth } from "@/lib/auth/config";
import { getUserLeagues } from "@/lib/db/queries/leagues";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function LeaguesPage() {
  const session = await auth();
  const userLeagues = await getUserLeagues(session!.user.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Leagues</h1>
          <p className="text-muted-foreground">Manage your game leagues</p>
        </div>
        <div className="flex gap-3">
          <Button asChild variant="outline">
            <Link href="/leagues/join">Join League</Link>
          </Button>
          <Button asChild>
            <Link href="/leagues/new">Create League</Link>
          </Button>
        </div>
      </div>

      {userLeagues.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="mb-4 text-muted-foreground">You haven&apos;t joined any leagues yet</p>
            <div className="flex gap-3">
              <Button asChild variant="outline">
                <Link href="/leagues/join">Join a League</Link>
              </Button>
              <Button asChild>
                <Link href="/leagues/new">Create Your First League</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {userLeagues.map(({ league, membership }) => (
            <Link href={`/leagues/${league.id}`} key={league.id}>
              <Card className="transition-colors hover:bg-accent">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-xl">{league.name}</CardTitle>
                    {membership.isAdmin && (
                      <span className="rounded-full bg-primary px-2 py-1 text-xs text-primary-foreground">
                        Admin
                      </span>
                    )}
                  </div>
                  {league.description && (
                    <CardDescription className="line-clamp-2">
                      {league.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    Joined {new Date(membership.joinedAt).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
