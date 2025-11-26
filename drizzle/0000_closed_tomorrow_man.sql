CREATE TABLE "root_game_players" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"game_id" uuid NOT NULL,
	"player_name" text NOT NULL,
	"user_id" uuid,
	"faction" text NOT NULL,
	"score" integer,
	"is_winner" boolean DEFAULT false NOT NULL,
	"is_dominance_victory" boolean DEFAULT false NOT NULL,
	"order" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "root_games" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"league_id" uuid NOT NULL,
	"date" date DEFAULT now() NOT NULL,
	"map" text NOT NULL,
	"image_url" text,
	"entry_method" text DEFAULT 'manual' NOT NULL,
	"ocr_corrected" boolean,
	"created_by" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "root_league_memberships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"league_id" uuid NOT NULL,
	"user_id" uuid,
	"is_admin" boolean DEFAULT false NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	"left_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "root_leagues" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"password_hash" text NOT NULL,
	"created_by" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "root_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"username" text NOT NULL,
	"direwolf_username" text,
	"password_hash" text,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "root_users_email_unique" UNIQUE("email"),
	CONSTRAINT "root_users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "root_game_players" ADD CONSTRAINT "root_game_players_game_id_root_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."root_games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "root_game_players" ADD CONSTRAINT "root_game_players_user_id_root_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."root_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "root_games" ADD CONSTRAINT "root_games_league_id_root_leagues_id_fk" FOREIGN KEY ("league_id") REFERENCES "public"."root_leagues"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "root_games" ADD CONSTRAINT "root_games_created_by_root_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."root_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "root_league_memberships" ADD CONSTRAINT "root_league_memberships_league_id_root_leagues_id_fk" FOREIGN KEY ("league_id") REFERENCES "public"."root_leagues"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "root_league_memberships" ADD CONSTRAINT "root_league_memberships_user_id_root_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."root_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "root_leagues" ADD CONSTRAINT "root_leagues_created_by_root_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."root_users"("id") ON DELETE no action ON UPDATE no action;