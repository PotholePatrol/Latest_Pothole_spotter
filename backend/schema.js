// schema.ts
// import { like } from 'drizzle-orm';
import { json } from 'drizzle-orm/gel-core';
import { boolean, mysqlTable, int, varchar, float, timestamp } from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';
import knex from 'knex';
import mysql from 'mysql2/promise'
import * as dotenv from "dotenv";

dotenv.config();

export const Odb = knex({
  client: "mysql2",
  connection: {
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASS || "75223031",
    database: process.env.DB_NAME || "smartroads",
  },
  pool: { min: 0, max: 10 },
});


// Users table
export const users = mysqlTable('users', {
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
  profilePic: varchar('profile_pic', { length: 255 }).default('https://th.bing.com/th/id/OIP.1yoSL-WO0YU5mQKROudvswHaHa?w=180&h=180&c=7&r=0&o=7&pid=1.7&rm=3'),
});

// User Location Preferences table
export const locationPreferences = mysqlTable('location_preferences', {
  id: varchar('id', { length: 36 }).primaryKey(),
  // Relationship to users table
  userId: varchar('user_id', { length: 36 }).notNull().references(() => users.id, {
    onDelete: 'cascade',
  }), preferredLat: float('preferred_lat'),
  preferredLng: float('preferred_lng'),
});

// Detections table
export const detections = mysqlTable('detections', {
  id: varchar('id', { length: 36 }).primaryKey(),
  user_id: varchar('user_id', { length: 36 }),
  label: varchar('label', { length: 255 }),
  imageUrl: varchar('image_url', { length: 255 }),
  confidence: float('confidence'),
  lat: float('lat'),
  lng: float('lng'),
  stretchStartLat: float('stretch_start_lat'),
  stretchStartLng: float('stretch_start_lng'),
  stretchEndLat: float('stretch_end_lat'),
  stretchEndLng: float('stretch_end_lng'),
  createdAt: timestamp('created_at').defaultNow(),
});


// contact_us_feedback table
export const contact_us_feedback = mysqlTable('contact_us_feedback', {
  id: int('id').primaryKey().autoincrement(),
  username: varchar('username', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  reply: varchar('reply', { length: 255 }).notNull(), // or use text()
  message: varchar('message', { length: 1024 }).notNull(), // or text()
  isPublic: boolean('is_public').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  likes: json('likes').default([]),
  dislikes: json('dislikes').default([]),
});

export const contact_us_feedback_reply = mysqlTable('contact_us_feedback_reply', {
  id: int('id').primaryKey().autoincrement(),
  feedbackId: int('feedback_id')
    .notNull()
    .references(() => contact_us_feedback.id, { onDelete: 'cascade' }),
  admin_email: varchar('email', { length: 255 }).notNull(),
  reply: varchar('reply', { length: 255 }).notNull(), // or text()
  message: varchar('message', { length: 1024 }).notNull(),
  isPublic: boolean('is_public').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  likes: json('likes').default([]),
  dislikes: json('dislikes').default([]),
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
