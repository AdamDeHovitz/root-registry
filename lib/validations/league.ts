import { z } from "zod";

export const createLeagueSchema = z.object({
  name: z
    .string()
    .min(3, "League name must be at least 3 characters")
    .max(50, "League name must be less than 50 characters"),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
  password: z
    .string()
    .min(4, "League password must be at least 4 characters")
    .max(50, "League password must be less than 50 characters"),
});

export const joinLeagueSchema = z.object({
  leagueId: z.string().uuid("Invalid league ID"),
  password: z.string().min(1, "Password is required"),
});

export type CreateLeagueInput = z.infer<typeof createLeagueSchema>;
export type JoinLeagueInput = z.infer<typeof joinLeagueSchema>;
