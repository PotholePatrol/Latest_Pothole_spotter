// schema.ts
// import { like } from 'drizzle-orm';
import {
  pgTable,
  boolean,
  integer,
  varchar,
  real,
  timestamp,
  jsonb,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import knex from 'knex';
import * as dotenv from "dotenv";

dotenv.config();

export const Odb = knex({
  client: "pg",
  connection: {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASS || "",
    database: process.env.DB_NAME || "postgres",
    ssl: {
      rejectUnauthorized: false,
    },
  },
  pool: { min: 0, max: 10 },
});

// Users table
export const users = pgTable('users', {
  id: varchar('id', { length: 36 }).primaryKey(),
  googleId: varchar("google_id", { length: 255 }),
  first_name: varchar('first_name', { length: 255 }).notNull(),
  last_name: varchar('last_name', { length: 255 }).notNull(),
  password: varchar('password', { length: 255 }),
  phone_number: varchar("phone_number", { length: 255 }).unique(),
  email: varchar('email', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  country: varchar('country', { length: 100 }),
  isAdmin: boolean('is_admin').default(false),
  isGoogleAccount: boolean('is_google_account').default(false),
  profilePic: varchar('profile_pic', { length: 255 }).default(
    'https://th.bing.com/th/id/OIP.1yoSL-WO0YU5mQKROudvswHaHa?w=180&h=180&c=7&r=0&o=7&pid=1.7&rm=3'
  ),
});

// User Location Preferences table
export const locationPreferences = pgTable('location_preferences', {
  id: varchar('id', { length: 36 }).primaryKey(),

  userId: varchar('user_id', { length: 36 })
    .notNull()
    .references(() => users.id, {
      onDelete: 'cascade',
    }),

  preferredLat: real('preferred_lat'),
  preferredLng: real('preferred_lng'),
});

// Detections table
export const detections = pgTable('detections', {
  id: varchar('id', { length: 36 }).primaryKey(),
  user_id: varchar('user_id', { length: 36 }),
  label: varchar('label', { length: 255 }),
  imageUrl: varchar('image_url', { length: 255 }),
  confidence: real('confidence'),
  lat: real('lat'),
  lng: real('lng'),
  stretchStartLat: real('stretch_start_lat'),
  stretchStartLng: real('stretch_start_lng'),
  stretchEndLat: real('stretch_end_lat'),
  stretchEndLng: real('stretch_end_lng'),
  createdAt: timestamp('created_at').defaultNow(),
});

// contact_us_feedback table
export const contact_us_feedback = pgTable('contact_us_feedback', {
  id: integer('id').generatedAlwaysAsIdentity().primaryKey(),
  username: varchar('username', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  reply: varchar('reply', { length: 255 }).notNull(),
  message: varchar('message', { length: 1024 }).notNull(),
  isPublic: boolean('is_public').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  likes: jsonb('likes').default([]),
  dislikes: jsonb('dislikes').default([]),
});

export const contact_us_feedback_reply = pgTable('contact_us_feedback_reply', {
  id: integer('id').generatedAlwaysAsIdentity().primaryKey(),

  feedbackId: integer('feedback_id')
    .notNull()
    .references(() => contact_us_feedback.id, {
      onDelete: 'cascade',
    }),

  admin_email: varchar('email', { length: 255 }).notNull(),
  reply: varchar('reply', { length: 255 }).notNull(),
  message: varchar('message', { length: 1024 }).notNull(),
  isPublic: boolean('is_public').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  likes: jsonb('likes').default([]),
  dislikes: jsonb('dislikes').default([]),
});

// INSTALL Required packages
// npm install drizzle-orm mysql2
// npm install -D drizzle-kit


// npx drizzle-kit generate
//  ->// Applies all generated migration files to the database
// This creates/updates tables in your actual database



// npx drizzle-kit migrate
// Use only when the DB schema is already manually in sync
// It marks schema state as synced without creating or running migrations

// npx drizzle-kit push //AVOID THIS





// USAGE EXAMPLE
// import { db } from './db';
// import { users, detections } from './schema';

// // CREATE
// await db.insert(users).values({ username: 'gee', email: 'gee@example.com' });

// // READ
// const allUsers = await db.select().from(users);

// // FILTER
// const specificUser = await db.select().from(users).where(users.username.eq('gee'));

// // UPDATE
// await db.update(users).set({ email: 'new@inbox.com' }).where(users.id.eq(1));

// // DELETE
// await db.delete(users).where(users.id.eq(2));
