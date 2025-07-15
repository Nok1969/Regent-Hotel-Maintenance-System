import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  boolean,
  integer,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (mandatory for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role", { enum: ["admin", "staff"] }).default("staff").notNull(),
  language: varchar("language", { enum: ["en", "th"] }).default("en").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Repair requests table
export const repairs = pgTable("repairs", {
  id: serial("id").primaryKey(),
  room: varchar("room").notNull(),
  category: varchar("category", { 
    enum: ["electrical", "plumbing", "air_conditioning", "furniture", "other"] 
  }).notNull(),
  urgency: varchar("urgency", { enum: ["high", "medium", "low"] }).notNull(),
  description: text("description").notNull(),
  images: text("images").array().default([]),
  status: varchar("status", { 
    enum: ["pending", "in_progress", "completed"] 
  }).default("pending").notNull(),
  userId: varchar("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  repairs: many(repairs),
}));

export const repairsRelations = relations(repairs, ({ one }) => ({
  user: one(users, {
    fields: [repairs.userId],
    references: [users.id],
  }),
}));

// Schemas
export const upsertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertRepairSchema = createInsertSchema(repairs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateRepairSchema = insertRepairSchema.partial().extend({
  id: z.number(),
});

// Types
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertRepair = z.infer<typeof insertRepairSchema>;
export type UpdateRepair = z.infer<typeof updateRepairSchema>;
export type Repair = typeof repairs.$inferSelect;
export type RepairWithUser = Repair & { user: User };
