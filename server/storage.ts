import {
  users,
  repairs,
  type User,
  type UpsertUser,
  type Repair,
  type InsertRepair,
  type UpdateRepair,
  type RepairWithUser,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, like, count } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUserRole(userId: string, role: string): Promise<User>;
  
  // Repair operations
  createRepair(repair: InsertRepair): Promise<Repair>;
  getRepairs(filters?: {
    userId?: string;
    status?: string;
    category?: string;
    limit?: number;
    offset?: number;
  }): Promise<RepairWithUser[]>;
  getRepairById(id: number): Promise<RepairWithUser | undefined>;
  updateRepair(repair: UpdateRepair): Promise<Repair>;
  getRepairStats(): Promise<{
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    byCategory: Record<string, number>;
    byStatus: Record<string, number>;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(users.createdAt);
  }

  async updateUserRole(userId: string, role: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ 
        role: role as any,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Repair operations
  async createRepair(repair: InsertRepair): Promise<Repair> {
    const [newRepair] = await db
      .insert(repairs)
      .values(repair)
      .returning();
    return newRepair;
  }

  async getRepairs(filters: {
    userId?: string;
    status?: string;
    category?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<RepairWithUser[]> {
    const { userId, status, category, limit = 50, offset = 0 } = filters;
    
    const conditions = [];
    if (userId) conditions.push(eq(repairs.userId, userId));
    if (status) conditions.push(eq(repairs.status, status as any));
    if (category) conditions.push(eq(repairs.category, category as any));

    const query = db
      .select({
        id: repairs.id,
        room: repairs.room,
        category: repairs.category,
        urgency: repairs.urgency,
        description: repairs.description,
        images: repairs.images,
        status: repairs.status,
        userId: repairs.userId,
        createdAt: repairs.createdAt,
        updatedAt: repairs.updatedAt,
        user: {
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
          role: users.role,
          language: users.language,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        },
      })
      .from(repairs)
      .innerJoin(users, eq(repairs.userId, users.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(repairs.createdAt))
      .limit(limit)
      .offset(offset);

    return await query;
  }

  async getRepairById(id: number): Promise<RepairWithUser | undefined> {
    const result = await db
      .select({
        id: repairs.id,
        room: repairs.room,
        category: repairs.category,
        urgency: repairs.urgency,
        description: repairs.description,
        images: repairs.images,
        status: repairs.status,
        userId: repairs.userId,
        createdAt: repairs.createdAt,
        updatedAt: repairs.updatedAt,
        user: {
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
          role: users.role,
          language: users.language,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        },
      })
      .from(repairs)
      .innerJoin(users, eq(repairs.userId, users.id))
      .where(eq(repairs.id, id));
    
    return result[0];
  }

  async updateRepair(repairData: UpdateRepair): Promise<Repair> {
    const { id, ...updateData } = repairData;
    const [updatedRepair] = await db
      .update(repairs)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(repairs.id, id))
      .returning();
    return updatedRepair;
  }

  async getRepairStats(): Promise<{
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    byCategory: Record<string, number>;
    byStatus: Record<string, number>;
  }> {
    // Get total counts by status
    const statusCounts = await db
      .select({
        status: repairs.status,
        count: count(),
      })
      .from(repairs)
      .groupBy(repairs.status);

    // Get counts by category
    const categoryCounts = await db
      .select({
        category: repairs.category,
        count: count(),
      })
      .from(repairs)
      .groupBy(repairs.category);

    const stats = {
      total: 0,
      pending: 0,
      inProgress: 0,
      completed: 0,
      byCategory: {} as Record<string, number>,
      byStatus: {} as Record<string, number>,
    };

    statusCounts.forEach(({ status, count }) => {
      stats.byStatus[status] = count;
      stats.total += count;
      
      if (status === "pending") stats.pending = count;
      else if (status === "in_progress") stats.inProgress = count;
      else if (status === "completed") stats.completed = count;
    });

    categoryCounts.forEach(({ category, count }) => {
      stats.byCategory[category] = count;
    });

    return stats;
  }
}

export const storage = new DatabaseStorage();
