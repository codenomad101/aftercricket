import { pgTable, serial, varchar, text, boolean, timestamp, integer, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const userRoleEnum = pgEnum('user_role', ['admin', 'user']);

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  password: varchar('password', { length: 255 }).notNull(),
  role: userRoleEnum('role').default('user').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const articles = pgTable('articles', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 500 }).notNull(),
  slug: varchar('slug', { length: 500 }).notNull().unique(),
  content: text('content').notNull(),
  excerpt: text('excerpt'),
  imageUrl: varchar('image_url', { length: 1000 }),
  categoryId: integer('category_id').references(() => categories.id).notNull(),
  authorId: integer('author_id').references(() => users.id).notNull(),
  published: boolean('published').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const apiCache = pgTable('api_cache', {
  id: serial('id').primaryKey(),
  key: varchar('key', { length: 255 }).notNull().unique(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const teams = pgTable('teams', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull().unique(),
  country: varchar('country', { length: 255 }).notNull(),
  flag: varchar('flag', { length: 10 }), // Emoji flag
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const players = pgTable('players', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  fullName: text('full_name'),
  teamId: integer('team_id').references(() => teams.id),
  role: varchar('role', { length: 100 }), // Batsman, Bowler, All-rounder, Wicket-keeper
  battingStyle: varchar('batting_style', { length: 100 }),
  bowlingStyle: varchar('bowling_style', { length: 100 }),
  dateOfBirth: timestamp('date_of_birth'),
  placeOfBirth: varchar('place_of_birth', { length: 255 }),
  imageUrl: text('image_url'),
  wikipediaUrl: text('wikipedia_url'),
  isInPlaying11: boolean('is_in_playing11').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const playerStats = pgTable('player_stats', {
  id: serial('id').primaryKey(),
  playerId: integer('player_id').references(() => players.id).notNull(),
  format: varchar('format', { length: 50 }).notNull(), // Test, ODI, T20I
  matches: integer('matches').default(0),
  runs: integer('runs').default(0),
  wickets: integer('wickets').default(0),
  battingAverage: varchar('batting_average', { length: 20 }),
  bowlingAverage: varchar('bowling_average', { length: 20 }),
  strikeRate: varchar('strike_rate', { length: 20 }),
  economyRate: varchar('economy_rate', { length: 20 }),
  highestScore: varchar('highest_score', { length: 20 }),
  bestBowling: varchar('best_bowling', { length: 50 }),
  centuries: integer('centuries').default(0),
  halfCenturies: integer('half_centuries').default(0),
  fiveWickets: integer('five_wickets').default(0),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  articles: many(articles),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  articles: many(articles),
}));

export const articlesRelations = relations(articles, ({ one }) => ({
  category: one(categories, {
    fields: [articles.categoryId],
    references: [categories.id],
  }),
  author: one(users, {
    fields: [articles.authorId],
    references: [users.id],
  }),
}));

export const teamsRelations = relations(teams, ({ many }) => ({
  players: many(players),
}));

export const playersRelations = relations(players, ({ one, many }) => ({
  team: one(teams, {
    fields: [players.teamId],
    references: [teams.id],
  }),
  stats: many(playerStats),
}));

export const playerStatsRelations = relations(playerStats, ({ one }) => ({
  player: one(players, {
    fields: [playerStats.playerId],
    references: [players.id],
  }),
}));

