import { pgTable, serial, varchar, text, timestamp, boolean, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod";

// ตารางสำหรับ Regent Cha-am Hotel
// Schema: regent_hotel

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }),
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  role: varchar("role", { length: 20 }).default("staff").$type<"admin" | "manager" | "staff" | "technician">(),
  language: varchar("language", { length: 2 }).default("th").$type<"en" | "th">(),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const repairs = pgTable("repairs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  room: varchar("room", { length: 10 }).notNull(),
  category: varchar("category", { length: 20 }).notNull().$type<"electrical" | "plumbing" | "airconditioning" | "furniture" | "other">(),
  urgency: varchar("urgency", { length: 10 }).notNull().$type<"low" | "medium" | "high">(),
  description: text("description").notNull(),
  status: varchar("status", { length: 20 }).default("pending").$type<"pending" | "inProgress" | "completed">(),
  technicianId: integer("technician_id").references(() => users.id),
  images: text("images").array(),
  notes: text("notes"),
  estimatedCompletion: timestamp("estimated_completion"),
  actualCompletion: timestamp("actual_completion"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  type: varchar("type", { length: 20 }).default("info").$type<"info" | "success" | "warning" | "error">(),
  read: boolean("read").default(false),
  data: jsonb("data"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const userSessions = pgTable("user_sessions", {
  sid: varchar("sid").primaryKey(),
  sess: jsonb("sess").notNull(),
  expire: timestamp("expire").notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  repairs: many(repairs, { relationName: "userRepairs" }),
  technicianRepairs: many(repairs, { relationName: "technicianRepairs" }),
}));

export const repairsRelations = relations(repairs, ({ one }) => ({
  user: one(users, {
    fields: [repairs.userId],
    references: [users.id],
    relationName: "userRepairs",
  }),
  technician: one(users, {
    fields: [repairs.technicianId],
    references: [users.id],
    relationName: "technicianRepairs",
  }),
}));

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users, {
  email: z.string().email(),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  role: z.enum(["admin", "manager", "staff", "technician"]),
  language: z.enum(["en", "th"]),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const selectUserSchema = createSelectSchema(users);

export const insertRepairSchema = createInsertSchema(repairs, {
  room: z.string().min(1).max(10),
  category: z.enum(["electrical", "plumbing", "airconditioning", "furniture", "other"]),
  urgency: z.enum(["low", "medium", "high"]),
  description: z.string().min(10),
  status: z.enum(["pending", "inProgress", "completed"]),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const selectRepairSchema = createSelectSchema(repairs);

export const insertNotificationSchema = createInsertSchema(notifications, {
  userId: z.string(),
  title: z.string().min(1).max(255),
  message: z.string().min(1),
  type: z.enum(["info", "success", "warning", "error"]),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const selectNotificationSchema = createSelectSchema(notifications);

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Repair = typeof repairs.$inferSelect;
export type InsertRepair = z.infer<typeof insertRepairSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;