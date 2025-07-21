import {
  users,
  repairs,
  notifications,
  type User,
  type UpsertUser,
  type Repair,
  type InsertRepair,
  type UpdateRepair,
  type RepairWithUser
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, like, count, sql, gte } from "drizzle-orm";
import bcrypt from "bcrypt";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUserRole(userId: string, role: string): Promise<User>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUserWithPassword(userData: {
    name: string;
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    role: string;
    language: string;
  }): Promise<User>;
  verifyPassword(userId: string, password: string): Promise<boolean>;
  
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
  
  // Notification operations
  createNotification(notification: {
    userId: string;
    title: string;
    description: string;
    type: "new_request" | "status_update" | "completed" | "assigned";
    isRead?: boolean;
    relatedId?: number;
  }): Promise<any>;
  getNotifications(userId: string): Promise<any[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(user: UpsertUser): Promise<User> {
    const { id, email, ...userData } = user;
    
    // Check if user exists
    const existingUser = await this.getUser(id);
    
    if (existingUser) {
      // Update existing user
      const [updatedUser] = await db
        .update(users)
        .set({
          ...userData,
          email,
          updatedAt: new Date(),
        })
        .where(eq(users.id, id))
        .returning();
      return updatedUser;
    } else {
      // Create new user
      const [newUser] = await db
        .insert(users)
        .values({
          id,
          email,
          ...userData,
        })
        .returning();
      return newUser;
    }
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

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(users.createdAt);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.firstName, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUserWithPassword(userData: {
    id?: string;
    name: string;
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    role: string;
    language: string;
  }): Promise<User> {
    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    const insertData: any = {
      name: userData.name,
      email: userData.email,
      password: hashedPassword,
      firstName: userData.firstName || userData.name.split(' ')[0],
      lastName: userData.lastName || userData.name.split(' ')[1] || '',
      role: userData.role as any,
      language: userData.language as any,
    };
    
    if (userData.id) {
      insertData.id = userData.id;
    }
    
    const [user] = await db
      .insert(users)
      .values(insertData)
      .returning();
    return user;
  }

  async verifyPassword(userId: string, password: string): Promise<boolean> {
    const user = await this.getUser(userId);
    if (!user || !user.password) return false;
    return await bcrypt.compare(password, user.password);
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
        // Select all repair fields
        id: repairs.id,
        room: repairs.room,
        category: repairs.category,
        urgency: repairs.urgency,
        description: repairs.description,
        images: repairs.images,
        status: repairs.status,
        userId: repairs.userId,
        assignedTo: repairs.assignedTo,
        createdAt: repairs.createdAt,
        updatedAt: repairs.updatedAt,
        // Select only necessary user fields
        user: {
          id: users.id,
          name: users.name,
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
        assignedTo: repairs.assignedTo,
        createdAt: repairs.createdAt,
        updatedAt: repairs.updatedAt,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          role: users.role,
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

  async updateRepairStatus(id: number, status: string, assignedTo?: string | null): Promise<Repair> {
    const updateData: any = { 
      status: status as any,
      updatedAt: new Date(),
    };
    
    // Update assignedTo if provided
    if (assignedTo !== undefined) {
      updateData.assignedTo = assignedTo;
    }
    
    const [repair] = await db
      .update(repairs)
      .set(updateData)
      .where(eq(repairs.id, id))
      .returning();
    return repair;
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
      const countNum = Number(count);
      stats.total += countNum;
      stats.byStatus[status] = countNum;
      
      if (status === "pending") stats.pending = countNum;
      else if (status === "in_progress") stats.inProgress = countNum;
      else if (status === "completed") stats.completed = countNum;
    });

    categoryCounts.forEach(({ category, count }) => {
      stats.byCategory[category] = Number(count);
    });

    return stats;
  }

  async getRepairStatsSummary(): Promise<{
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    todayCount: number;
    weekCount: number;
  }> {
    const stats = await this.getRepairStats();
    
    // Get today's count
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const [todayResult] = await db
      .select({ count: count() })
      .from(repairs)
      .where(gte(repairs.createdAt, today));

    // Get this week's count
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const [weekResult] = await db
      .select({ count: count() })
      .from(repairs)
      .where(gte(repairs.createdAt, weekAgo));

    return {
      ...stats,
      todayCount: Number(todayResult?.count || 0),
      weekCount: Number(weekResult?.count || 0),
    };
  }

  async getMonthlyStats(): Promise<Array<{ month: string; count: number; completed: number }>> {
    const monthlyData = await db
      .select({
        month: sql<string>`TO_CHAR(${repairs.createdAt}, 'YYYY-MM')`,
        count: count(),
        completed: count(sql`CASE WHEN ${repairs.status} = 'completed' THEN 1 END`),
      })
      .from(repairs)
      .where(gte(repairs.createdAt, sql`NOW() - INTERVAL '12 months'`))
      .groupBy(sql`TO_CHAR(${repairs.createdAt}, 'YYYY-MM')`)
      .orderBy(sql`TO_CHAR(${repairs.createdAt}, 'YYYY-MM')`);

    return monthlyData.map(row => ({
      month: row.month,
      count: Number(row.count),
      completed: Number(row.completed),
    }));
  }

  // Notification operations
  async createNotification(notification: {
    userId: string;
    title: string;
    description: string;
    type: "new_request" | "status_update" | "completed" | "assigned";
    isRead?: boolean;
    relatedId?: number;
  }): Promise<any> {
    const [newNotification] = await db
      .insert(notifications)
      .values(notification)
      .returning();
    return newNotification;
  }

  async getNotifications(userId: string): Promise<any[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(20);
  }
}

export const storage = new DatabaseStorage();