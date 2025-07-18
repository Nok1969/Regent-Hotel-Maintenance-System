import {
  users,
  repairs,
  type User,
  type UpsertUser,
  type Repair,
  type InsertRepair,
  type UpdateRepair,
  type RepairWithUser
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, like, count, sql, gte } from "drizzle-orm";

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
  getRepairStatsSummary(): Promise<{
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    todayCount: number;
    weekCount: number;
  }>;
  getMonthlyStats(): Promise<Array<{ month: string; count: number; completed: number }>>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select({
      id: users.id,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      profileImageUrl: users.profileImageUrl,
      role: users.role,
      language: users.language,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    }).from(users).where(eq(users.id, id));
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
    return await db.select({
      id: users.id,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      profileImageUrl: users.profileImageUrl,
      role: users.role,
      language: users.language,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    }).from(users).orderBy(users.createdAt);
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
    urgency?: string;
    search?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<RepairWithUser[]> {
    const { userId, status, category, urgency, search, limit = 50, offset = 0 } = filters;
    
    const conditions = [];
    if (userId) conditions.push(eq(repairs.userId, userId));
    if (status) conditions.push(eq(repairs.status, status as any));
    if (category) conditions.push(eq(repairs.category, category as any));
    if (urgency) conditions.push(eq(repairs.urgency, urgency as any));
    if (search) {
      conditions.push(
        or(
          like(repairs.room, `%${search}%`),
          like(repairs.description, `%${search}%`)
        )
      );
    }

    const query = db
      .select({
        // Select only necessary repair fields
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
        // Select only necessary user fields
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          role: users.role,
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
    // Get total counts by status using optimized query
    const statusCounts = await db
      .select({
        status: repairs.status,
        count: count(),
      })
      .from(repairs)
      .groupBy(repairs.status);

    // Get counts by category using optimized query
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

  // Optimized stats summary with single query
  async getRepairStatsSummary(): Promise<{
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    todayCount: number;
    weekCount: number;
  }> {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Single aggregated query for better performance
    const summaryResult = await db
      .select({
        total: count(),
        pending: sql<number>`count(case when ${repairs.status} = 'pending' then 1 end)`,
        inProgress: sql<number>`count(case when ${repairs.status} = 'in_progress' then 1 end)`,
        completed: sql<number>`count(case when ${repairs.status} = 'completed' then 1 end)`,
        todayCount: sql<number>`count(case when ${repairs.createdAt} >= ${today.toISOString()} then 1 end)`,
        weekCount: sql<number>`count(case when ${repairs.createdAt} >= ${weekAgo.toISOString()} then 1 end)`,
      })
      .from(repairs);

    return summaryResult[0] || {
      total: 0,
      pending: 0,
      inProgress: 0,
      completed: 0,
      todayCount: 0,
      weekCount: 0,
    };
  }

  // Monthly statistics with aggregation
  async getMonthlyStats(): Promise<Array<{ month: string; count: number; completed: number }>> {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyData = await db
      .select({
        month: sql<string>`to_char(${repairs.createdAt}, 'YYYY-MM')`,
        count: count(),
        completed: sql<number>`count(case when ${repairs.status} = 'completed' then 1 end)`,
      })
      .from(repairs)
      .where(gte(repairs.createdAt, sixMonthsAgo))
      .groupBy(sql`to_char(${repairs.createdAt}, 'YYYY-MM')`)
      .orderBy(sql`to_char(${repairs.createdAt}, 'YYYY-MM')`);

    // Format month names
    return monthlyData.map(({ month, count, completed }) => ({
      month: new Date(month + '-01').toLocaleDateString('en', { month: 'short' }),
      count,
      completed,
    }));
  }
}

export const storage = new DatabaseStorage();
