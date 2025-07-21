import { pgTable, serial, varchar, text, timestamp, boolean, integer, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod";

// Session storage table used by express-session
export const session = pgTable(
  "session",
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
  name: text("name").notNull(),
  email: varchar("email").unique().notNull(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role", { enum: ["admin", "manager", "staff", "technician"] }).default("staff").notNull(),
  language: varchar("language", { enum: ["en", "th"] }).default("en").notNull(),
  password: text("password").notNull(),
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
  assignedTo: varchar("assigned_to"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Notifications table
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  type: varchar("type", { 
    enum: ["new_request", "status_update", "completed", "assigned", "user_created"] 
  }).notNull(),
  isRead: boolean("is_read").default(false),
  relatedId: integer("related_id"), // repair ID or user ID
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

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

// Base validation schemas with shared types for consistency
export const roleEnum = z.enum(["admin", "manager", "staff", "technician"]);
export const languageEnum = z.enum(["en", "th"]);
export const categoryEnum = z.enum(["electrical", "plumbing", "air_conditioning", "furniture", "other"]);
export const urgencyEnum = z.enum(["high", "medium", "low"]);
export const statusEnum = z.enum(["pending", "in_progress", "completed"]);

// User schemas
export const upsertUserSchema = createInsertSchema(users, {
  role: roleEnum,
  language: languageEnum,
  email: z.string().email("Invalid email format"),
  name: z.string().min(1, "Name is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
}).omit({
  createdAt: true,
  updatedAt: true,
});

export const createUserSchema = z.object({
  name: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .regex(/^[a-zA-Zก-ฮ0-9\s]+$/, "Name can only contain letters, numbers and spaces"),
  email: z.string()
    .email("Invalid email format")
    .max(255, "Email must be less than 255 characters"),
  password: z.string()
    .min(6, "Password must be at least 6 characters"),
  firstName: z.string()
    .min(1, "First name is required")
    .max(50, "First name must be less than 50 characters")
    .regex(/^[a-zA-Zก-ฮ0-9]+$/, "First name can only contain letters and numbers"),
  lastName: z.string()
    .min(1, "Last name is required")
    .max(50, "Last name must be less than 50 characters")
    .regex(/^[a-zA-Zก-ฮ0-9]+$/, "Last name can only contain letters and numbers"),
  role: roleEnum,
  language: languageEnum.default("en"),
});

// Repair schemas with custom validation
export const baseRepairSchema = z.object({
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: categoryEnum,
  urgency: urgencyEnum,
  status: statusEnum.default("pending"),
  userId: z.string(),
  assignedTo: z.string().nullable().optional(),
  images: z.array(z.string()).default([]),
});

export const insertRepairSchema = baseRepairSchema.extend({
  // Frontend uses 'title' and 'location' instead of 'room'
  title: z.string().min(3, "Title must be at least 3 characters"),
  location: z.string().min(3, "Location must be at least 3 characters"),
}).refine((data) => {
  // Custom validation: high urgency requires detailed description
  if (data.urgency === "high" && data.description.length < 20) {
    return false;
  }
  return true;
}, {
  message: "High urgency repairs require detailed description (min 20 characters)",
  path: ["description"],
});

// Backend schema that matches the database structure
export const backendRepairSchema = baseRepairSchema.extend({
  room: z.string().min(3, "Room must be at least 3 characters"),
});

// Update schemas
export const updateRepairSchema = z.object({
  id: z.number(),
  title: z.string().min(3, "Title must be at least 3 characters").optional(),
  description: z.string().min(10, "Description must be at least 10 characters").optional(),
  category: categoryEnum.optional(),
  urgency: urgencyEnum.optional(),
  status: statusEnum.optional(),
  assignedTo: z.string().nullable().optional(),
  images: z.array(z.string()).optional(),
});

// Additional schemas needed by routes
export const repairFiltersSchema = z.object({
  userId: z.string().optional(),
  status: statusEnum.optional(),
  category: categoryEnum.optional(),
  urgency: urgencyEnum.optional(),
  search: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(10),
  offset: z.coerce.number().min(0).default(0),
});

export const userFiltersSchema = z.object({
  search: z.string().optional(),
  role: roleEnum.optional(),
  limit: z.coerce.number().min(1).max(100).default(10),
  offset: z.coerce.number().min(0).default(0),
});

export const updateUserRoleSchema = z.object({
  userId: z.string(),
  role: roleEnum,
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type CreateUser = z.infer<typeof createUserSchema>;

export type Repair = typeof repairs.$inferSelect;
export type InsertRepair = z.infer<typeof insertRepairSchema>;
export type BackendRepair = z.infer<typeof backendRepairSchema>;
export type UpdateRepair = z.infer<typeof updateRepairSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

export type RepairWithUser = Repair & {
  user: Pick<User, 'id' | 'name' | 'email' | 'firstName' | 'lastName' | 'role'>;
};