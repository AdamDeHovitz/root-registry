-- Move root-registry's tables out of `public` into their own schema. The
-- Supabase project is shared: readers-choice's staging database owns `public`
-- and resets it, and wedding-map lives in `wedding_map`.
-- Indexes, constraints and sequences move with the tables.

BEGIN;

CREATE SCHEMA root_registry;

ALTER TABLE public.root_users              SET SCHEMA root_registry;
ALTER TABLE public.root_leagues            SET SCHEMA root_registry;
ALTER TABLE public.root_league_memberships SET SCHEMA root_registry;
ALTER TABLE public.root_games              SET SCHEMA root_registry;
ALTER TABLE public.root_game_players       SET SCHEMA root_registry;
ALTER TABLE public.root_ocr_corrections    SET SCHEMA root_registry;

COMMIT;
