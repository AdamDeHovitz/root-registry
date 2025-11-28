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
  order: z.number().int().min(0),
});

export const createGameSchema = z
  .object({
    leagueId: z.string().uuid("Invalid league ID"),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
    map: z.enum(MAPS as unknown as [string, ...string[]], {
      message: "Invalid map",
    }),
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
  );

export type GamePlayerInput = z.infer<typeof gamePlayerSchema>;
export type CreateGameInput = z.infer<typeof createGameSchema>;
