import { pgTable, serial, varchar, text, timestamp, boolean, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod";

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
  assignedRepairs: many(repairs, { relationName: "technicianRepairs" }),
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
  email: z.string().email("Invalid email format"),
  firstName: z.string().min(1, "First name is required").max(100, "First name too long"),
  lastName: z.string().min(1, "Last name is required").max(100, "Last name too long"),
  role: z.enum(["admin", "manager", "staff", "technician"]),
  language: z.enum(["en", "th"]),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const selectUserSchema = createSelectSchema(users);

export const insertRepairSchema = createInsertSchema(repairs, {
  room: z.string().min(1, "Room is required").max(10, "Room number too long"),
  category: z.enum(["electrical", "plumbing", "airconditioning", "furniture", "other"]),
  urgency: z.enum(["low", "medium", "high"]),
  description: z.string().min(10, "Description must be at least 10 characters").max(1000, "Description too long"),
  status: z.enum(["pending", "inProgress", "completed"]),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const selectRepairSchema = createSelectSchema(repairs);

export const insertNotificationSchema = createInsertSchema(notifications, {
  userId: z.string().min(1, "User ID is required"),
  title: z.string().min(1, "Title is required").max(255, "Title too long"),
  message: z.string().min(1, "Message is required"),
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

export type UserSession = typeof userSessions.$inferSelect;