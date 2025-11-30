import { z } from "zod";
import { FACTIONS } from "../constants/factions";
import { MAPS } from "../constants/maps";

export const gamePlayerSchema = z.object({
  playerName: z.string().min(1, "Player name is required"),
  userId: z.string().uuid().optional(),
  faction: z.enum(FACTIONS as unknown as [string, ...string[]], {
    message: "Invalid faction",
  }),
  score: z.number().int().min(0).max(100).optional(),
  isWinner: z.boolean(),
  isDominance: z.boolean(),
  coalitionWith: z.string().optional(),
  order: z.number().int().min(0),
});

export const createGameSchema = z
  .object({
    leagueId: z.string().uuid("Invalid league ID"),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
    map: z.enum(MAPS as unknown as [string, ...string[]], {
      message: "Invalid map",
    }),
    description: z.string().optional(),
    imageUrl: z.string().optional(),
    players: z
      .array(gamePlayerSchema)
      .min(2, "At least 2 players required")
      .max(6, "Maximum 6 players allowed"),
  })
  .refine(
    (data) => {
      // At least one winner required
      return data.players.some((p) => p.isWinner);
    },
    {
      message: "At least one player must be marked as winner",
      path: ["players"],
    }
  )
  .refine(
    (data) => {
      // Check for duplicate factions (except Vagabond variants)
      const nonVagabondFactions = data.players
        .map((p) => p.faction)
        .filter((f) => !f.includes("Vagabond"));

      const uniqueFactions = new Set(nonVagabondFactions);
      return uniqueFactions.size === nonVagabondFactions.length;
    },
    {
      message: "Duplicate factions are not allowed (except Vagabond)",
      path: ["players"],
    }
  )
  .refine(
    (data) => {
      // Validate Vagabond coalitions
      for (const player of data.players) {
        // If coalitionWith is set, player must be a Vagabond with dominance
        if (player.coalitionWith) {
          if (!player.faction.includes("Vagabond")) {
            return false;
          }
          if (!player.isDominance) {
            return false;
          }
        }

        // If Vagabond with dominance and marked as winner, must have coalitionWith
        // OR there must be another non-Vagabond winner (the coalition partner)
        if (
          player.faction.includes("Vagabond") &&
          player.isDominance &&
          player.isWinner
        ) {
          const hasCoalitionSet = !!player.coalitionWith;
          const hasOtherWinner = data.players.some(
            (p) => p.isWinner && p !== player && !p.faction.includes("Vagabond")
          );

          if (!hasCoalitionSet && !hasOtherWinner) {
            return false;
          }
        }
      }
      return true;
    },
    {
      message:
        "Coalition rules violated: Vagabonds with dominance must have a coalition partner set or a non-Vagabond winner",
      path: ["players"],
    }
  );

export type GamePlayerInput = z.infer<typeof gamePlayerSchema>;
export type CreateGameInput = z.infer<typeof createGameSchema>;
