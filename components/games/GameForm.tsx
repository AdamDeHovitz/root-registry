"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FACTIONS } from "@/lib/constants/factions";
import { MAPS } from "@/lib/constants/maps";
import { X } from "lucide-react";
import { OCRUpload } from "./OCRUpload";

interface Player {
  playerName: string;
  userId?: string;
  faction: string;
  score?: number;
  isWinner: boolean;
  isDominance: boolean;
  coalitionWith?: string;
  order: number;
}

interface GameFormProps {
  leagueId: string;
  currentUsername: string;
  currentUserId: string;
}

export function GameForm({ leagueId, currentUsername, currentUserId }: GameFormProps) {
  const router = useRouter();
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [map, setMap] = useState("");
  const [players, setPlayers] = useState<Player[]>([
    {
      playerName: "",
      faction: "",
      score: undefined,
      isWinner: false,
      isDominance: false,
      coalitionWith: undefined,
      order: 0,
    },
    {
      playerName: "",
      faction: "",
      score: undefined,
      isWinner: false,
      isDominance: false,
      coalitionWith: undefined,
      order: 1,
    },
  ]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const addPlayer = () => {
    setPlayers([
      ...players,
      {
        playerName: "",
        faction: "",
        score: undefined,
        isWinner: false,
        isDominance: false,
        coalitionWith: undefined,
        order: players.length,
      },
    ]);
  };

  const removePlayer = (index: number) => {
    if (players.length <= 2) {
      setError("A game must have at least 2 players");
      return;
    }
    setPlayers(players.filter((_, i) => i !== index));
  };

  const updatePlayer = (index: number, field: keyof Player, value: unknown) => {
    const updated = [...players];
    updated[index] = { ...updated[index], [field]: value };
    setPlayers(updated);
  };

  const handleOCRComplete = (data: {
    map?: string;
    players: Array<{
      playerName?: string;
      faction: string;
      score?: number;
      isWinner?: boolean;
      isDominance?: boolean;
      coalitionWith?: string;
      order?: number;
    }>;
  }) => {
    // Set map if detected
    if (data.map) {
      setMap(data.map);
    }

    // Update players with OCR data
    if (data.players.length > 0) {
      const updatedPlayers: Player[] = data.players.map((ocrPlayer, index) => ({
        playerName: ocrPlayer.playerName || "",
        userId: ocrPlayer.playerName?.toLowerCase() === currentUsername.toLowerCase() ? currentUserId : undefined,
        faction: ocrPlayer.faction,
        score: ocrPlayer.score,
        isWinner: ocrPlayer.isWinner ?? false,
        isDominance: ocrPlayer.isDominance ?? false,
        coalitionWith: ocrPlayer.coalitionWith,
        order: index,
      }));

      setPlayers(updatedPlayers);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!map) {
      setError("Please select a map");
      return;
    }

    if (players.length < 2) {
      setError("A game must have at least 2 players");
      return;
    }

    if (players.length > 6) {
      setError("A game cannot have more than 6 players");
      return;
    }

    for (const player of players) {
      if (!player.playerName) {
        setError("All players must have a name");
        return;
      }
      if (!player.faction) {
        setError("All players must select a faction");
        return;
      }
    }

    // Validate that the current user is one of the players
    const currentUserIsPlayer = players.some(
      (p) => p.playerName.toLowerCase() === currentUsername.toLowerCase()
    );

    if (!currentUserIsPlayer) {
      setError("You must be one of the players in the game");
      return;
    }

    const winners = players.filter((p) => p.isWinner);
    if (winners.length === 0) {
      setError("At least one player must be marked as the winner");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leagueId,
          date,
          map,
          players: players.map((p, i) => ({
            ...p,
            order: i,
            // Set userId for the player matching current username
            userId: p.playerName.toLowerCase() === currentUsername.toLowerCase() ? currentUserId : p.userId,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create game");
        return;
      }

      router.push(`/leagues/${leagueId}`);
      router.refresh();
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <OCRUpload onOCRComplete={handleOCRComplete} />

      <Card>
        <CardHeader>
          <CardTitle>Game Details</CardTitle>
          <CardDescription>When and where was the game played?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="map">Map</Label>
              <select
                id="map"
                value={map}
                onChange={(e) => setMap(e.target.value)}
                required
                disabled={isLoading}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select a map</option>
                {MAPS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Players ({players.length})</CardTitle>
              <CardDescription>Record each player's performance</CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addPlayer}
              disabled={isLoading || players.length >= 6}
            >
              Add Player
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {players.map((player, index) => (
            <div key={index} className="space-y-3 rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">
                  Player {index + 1}
                  {player.playerName.toLowerCase() === currentUsername.toLowerCase() && (
                    <span className="ml-2 text-xs text-muted-foreground">(You)</span>
                  )}
                </h4>
                {players.length > 2 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removePlayer(index)}
                    disabled={isLoading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor={`player-${index}-name`}>Player Name</Label>
                  <Input
                    id={`player-${index}-name`}
                    value={player.playerName}
                    onChange={(e) => updatePlayer(index, "playerName", e.target.value)}
                    placeholder="Player name"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`player-${index}-faction`}>Faction</Label>
                  <select
                    id={`player-${index}-faction`}
                    value={player.faction}
                    onChange={(e) => updatePlayer(index, "faction", e.target.value)}
                    required
                    disabled={isLoading}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Select faction</option>
                    {FACTIONS.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`player-${index}-score`}>
                    Score {player.isDominance && "(optional)"}
                  </Label>
                  <Input
                    id={`player-${index}-score`}
                    type="number"
                    min="0"
                    max="100"
                    value={player.score ?? ""}
                    onChange={(e) =>
                      updatePlayer(
                        index,
                        "score",
                        e.target.value ? parseInt(e.target.value) : undefined
                      )
                    }
                    disabled={isLoading || player.isDominance}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`player-${index}-winner`}
                      checked={player.isWinner}
                      onChange={(e) => updatePlayer(index, "isWinner", e.target.checked)}
                      disabled={isLoading}
                      className="h-4 w-4"
                    />
                    <Label htmlFor={`player-${index}-winner`} className="font-normal">
                      Winner
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`player-${index}-dominance`}
                      checked={player.isDominance}
                      onChange={(e) =>
                        updatePlayer(index, "isDominance", e.target.checked)
                      }
                      disabled={isLoading}
                      className="h-4 w-4"
                    />
                    <Label htmlFor={`player-${index}-dominance`} className="font-normal">
                      Dominance
                    </Label>
                  </div>
                </div>
              </div>

              {player.faction.startsWith("Vagabond") && player.isDominance && (
                <div className="space-y-2 pt-3 border-t">
                  <Label htmlFor={`player-${index}-coalition`}>
                    Coalition Partner (Vagabond allies with this faction)
                  </Label>
                  <select
                    id={`player-${index}-coalition`}
                    value={player.coalitionWith || ""}
                    onChange={(e) => updatePlayer(index, "coalitionWith", e.target.value || undefined)}
                    disabled={isLoading}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Select coalition partner</option>
                    {FACTIONS.filter(f => !f.startsWith("Vagabond")).map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-muted-foreground">
                    The Vagabond wins if this faction wins
                  </p>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {error && (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <div className="flex gap-3">
        <Button type="submit" className="flex-1" disabled={isLoading}>
          {isLoading ? "Creating Game..." : "Create Game"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
