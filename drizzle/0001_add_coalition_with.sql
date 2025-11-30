-- Rename is_dominance_victory to is_dominance for consistency
ALTER TABLE "root_game_players" RENAME COLUMN "is_dominance_victory" TO "is_dominance";

-- Add coalition_with column for Vagabond coalitions
ALTER TABLE "root_game_players" ADD COLUMN "coalition_with" text;
