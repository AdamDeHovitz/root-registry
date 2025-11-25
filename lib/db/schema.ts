import { pgTable, uuid, text, timestamp, boolean, integer, date } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

/**
 * Users table
 * Stores user authentication and profile information
 * Prefixed with 'root_' to coexist with other projects in shared Supabase
 */
export const users = pgTable("root_users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").unique().notNull(),
  username: text("username").unique().notNull(),
  direwolfUsername: text("direwolf_username"),
  passwordHash: text("password_hash"),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * Leagues table
 * Password-protected groups where games are tracked
 */
export const leagues = pgTable("root_leagues", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  passwordHash: text("password_hash").notNull(),
  createdBy: uuid("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * League Memberships table
 * Tracks users' membership in leagues and admin status
 */
export const leagueMemberships = pgTable("root_league_memberships", {
  id: uuid("id").defaultRandom().primaryKey(),
  leagueId: uuid("league_id").references(() => leagues.id, { onDelete: "cascade" }).notNull(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  isAdmin: boolean("is_admin").default(false).notNull(),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
  leftAt: timestamp("left_at"),
});

/**
 * Games table
 * Stores information about each played game
 */
export const games = pgTable("root_games", {
  id: uuid("id").defaultRandom().primaryKey(),
  leagueId: uuid("league_id").references(() => leagues.id, { onDelete: "cascade" }).notNull(),
  date: date("date").defaultNow().notNull(),
  map: text("map").notNull(),
  imageUrl: text("image_url"),
  entryMethod: text("entry_method", { enum: ["manual", "ocr_tesseract"] }).default("manual").notNull(),
  ocrCorrected: boolean("ocr_corrected"),
  createdBy: uuid("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * Game Players table
 * Stores player information for each game
 */
export const gamePlayers = pgTable("root_game_players", {
  id: uuid("id").defaultRandom().primaryKey(),
  gameId: uuid("game_id").references(() => games.id, { onDelete: "cascade" }).notNull(),
  playerName: text("player_name").notNull(),
  userId: uuid("user_id").references(() => users.id),
  faction: text("faction").notNull(),
  score: integer("score"),
  isWinner: boolean("is_winner").default(false).notNull(),
  isDominanceVictory: boolean("is_dominance_victory").default(false).notNull(),
  order: integer("order").notNull(),
});

/**
 * Relations
 */
export const usersRelations = relations(users, ({ many }) => ({
  leagueMemberships: many(leagueMemberships),
  createdLeagues: many(leagues),
  games: many(games),
  gamePlayers: many(gamePlayers),
}));

export const leaguesRelations = relations(leagues, ({ one, many }) => ({
  creator: one(users, {
    fields: [leagues.createdBy],
    references: [users.id],
  }),
  memberships: many(leagueMemberships),
  games: many(games),
}));

export const leagueMembershipsRelations = relations(leagueMemberships, ({ one }) => ({
  league: one(leagues, {
    fields: [leagueMemberships.leagueId],
    references: [leagues.id],
  }),
  user: one(users, {
    fields: [leagueMemberships.userId],
    references: [users.id],
  }),
}));

export const gamesRelations = relations(games, ({ one, many }) => ({
  league: one(leagues, {
    fields: [games.leagueId],
    references: [leagues.id],
  }),
  creator: one(users, {
    fields: [games.createdBy],
    references: [users.id],
  }),
  players: many(gamePlayers),
}));

export const gamePlayersRelations = relations(gamePlayers, ({ one }) => ({
  game: one(games, {
    fields: [gamePlayers.gameId],
    references: [games.id],
  }),
  user: one(users, {
    fields: [gamePlayers.userId],
    references: [users.id],
  }),
}));

/**
 * Type exports for use throughout the application
 */
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type League = typeof leagues.$inferSelect;
export type NewLeague = typeof leagues.$inferInsert;

export type LeagueMembership = typeof leagueMemberships.$inferSelect;
export type NewLeagueMembership = typeof leagueMemberships.$inferInsert;

export type Game = typeof games.$inferSelect;
export type NewGame = typeof games.$inferInsert;

export type GamePlayer = typeof gamePlayers.$inferSelect;
export type NewGamePlayer = typeof gamePlayers.$inferInsert;
