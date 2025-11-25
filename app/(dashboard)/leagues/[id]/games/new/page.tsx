import { auth } from "@/lib/auth/config";
import { findLeagueById, isLeagueMember } from "@/lib/db/queries/leagues";
import { GameForm } from "@/components/games/GameForm";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

export default async function NewGamePage({ params }: { params: Promise<{ id: string }> }) {
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
    redirect(`/leagues/${id}`);
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <Link
          href={`/leagues/${id}`}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to {league.name}
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-bold">Add New Game</h1>
        <p className="text-muted-foreground">Record a game for {league.name}</p>
      </div>

      <GameForm
        leagueId={id}
        currentUsername={session.user.username}
        currentUserId={session.user.id}
      />
    </div>
  );
}
