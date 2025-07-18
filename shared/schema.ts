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
  role: varchar("role", { enum: ["admin", "manager", "staff", "technician"] }).default("staff").notNull(),
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

// Base validation schemas with shared types for consistency
export const roleEnum = z.enum(["admin", "manager", "staff", "technician"]);
export const languageEnum = z.enum(["en", "th"]);
export const categoryEnum = z.enum(["electrical", "plumbing", "hvac", "furniture", "other"]);
export const urgencyEnum = z.enum(["high", "medium", "low"]);
export const statusEnum = z.enum(["pending", "in_progress", "completed"]);

// User schemas
export const upsertUserSchema = createInsertSchema(users, {
  role: roleEnum,
  language: languageEnum,
}).omit({
  createdAt: true,
  updatedAt: true,
}).refine((data) => {
  // Custom validation: email is required if provided
  if (data.email && !data.email.includes("@")) {
    return false;
  }
  return true;
}, {
  message: "Invalid email format",
  path: ["email"],
});

// Repair schemas with custom validation
export const baseRepairSchema = z.object({
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: categoryEnum,
  urgency: urgencyEnum,
  status: statusEnum.default("pending"),
  userId: z.string(),
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

// Schedule-related schemas with time validation
export const scheduleSchema = z.object({
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  repairId: z.number(),
  technicianId: z.string(),
}).refine((data) => {
  // Custom validation: start time must be before end time
  const start = new Date(data.startTime);
  const end = new Date(data.endTime);
  return start < end;
}, {
  message: "Start time must be before end time",
  path: ["endTime"],
}).refine((data) => {
  // Custom validation: schedule must be in the future
  const start = new Date(data.startTime);
  const now = new Date();
  return start > now;
}, {
  message: "Schedule must be in the future",
  path: ["startTime"],
}).refine((data) => {
  // Custom validation: minimum duration of 30 minutes
  const start = new Date(data.startTime);
  const end = new Date(data.endTime);
  const diffInMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
  return diffInMinutes >= 30;
}, {
  message: "Minimum schedule duration is 30 minutes",
  path: ["endTime"],
});

// Update schemas
export const updateRepairSchema = z.object({
  id: z.number(),
  title: z.string().min(3, "Title must be at least 3 characters").optional(),
  description: z.string().min(10, "Description must be at least 10 characters").optional(),
  category: categoryEnum.optional(),
  urgency: urgencyEnum.optional(),
  location: z.string().min(3, "Location must be at least 3 characters").optional(),
  status: statusEnum.optional(),
  userId: z.string().optional(),
  images: z.array(z.string()).optional(),
}).refine((data) => {
  // Custom validation: high urgency requires detailed description if provided
  if (data.urgency === "high" && data.description && data.description.length < 20) {
    return false;
  }
  return true;
}, {
  message: "High urgency repairs require detailed description (min 20 characters)",
  path: ["description"],
});

export const updateUserRoleSchema = z.object({
  role: roleEnum,
});

// API validation schemas
export const paginationSchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(10),
  offset: z.coerce.number().min(0).default(0),
});

export const repairFiltersSchema = z.object({
  status: statusEnum.optional(),
  category: categoryEnum.optional(),
  urgency: urgencyEnum.optional(),
  search: z.string().optional(),
}).merge(paginationSchema);

export const userFiltersSchema = z.object({
  role: roleEnum.optional(),
  search: z.string().optional(),
}).merge(paginationSchema);

// Types - ensuring consistency between frontend and backend
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertRepair = z.infer<typeof insertRepairSchema>;
export type UpdateRepair = z.infer<typeof updateRepairSchema>;
export type Repair = typeof repairs.$inferSelect;
export type RepairWithUser = Repair & { user: User };
export type Schedule = z.infer<typeof scheduleSchema>;

// Enum types for type safety
export type Role = z.infer<typeof roleEnum>;
export type Language = z.infer<typeof languageEnum>;
export type Category = z.infer<typeof categoryEnum>;
export type Urgency = z.infer<typeof urgencyEnum>;
export type Status = z.infer<typeof statusEnum>;

// Filter types
export type RepairFilters = z.infer<typeof repairFiltersSchema>;
export type UserFilters = z.infer<typeof userFiltersSchema>;
export type Pagination = z.infer<typeof paginationSchema>;

// API response types for consistency
export type ApiResponse<T> = {
  data: T;
  success: boolean;
  message?: string;
};

export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
};
