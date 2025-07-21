import { users, repairs, notifications, type User, type InsertUser, type Repair, type InsertRepair, type Notification, type InsertNotification } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, like, count, sql } from "drizzle-orm";
import bcrypt from "bcrypt";

// User management
export async function getUser(id: number): Promise<User | undefined> {
  const [user] = await db.select().from(users).where(eq(users.id, id));
  return user || undefined;
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const [user] = await db.select().from(users).where(eq(users.email, email));
  return user || undefined;
}

export async function createUser(insertUser: InsertUser): Promise<User> {
  const userData = { ...insertUser };
  
  // Hash password if provided
  if (userData.password) {
    userData.password = await bcrypt.hash(userData.password, 10);
  }

  const [user] = await db
    .insert(users)
    .values(userData)
    .returning();
  return user;
}

export async function updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
  const updateData = { ...updates };
  
  // Hash password if being updated
  if (updateData.password) {
    updateData.password = await bcrypt.hash(updateData.password, 10);
  }

  const [user] = await db
    .update(users)
    .set({ ...updateData, updatedAt: new Date() })
    .where(eq(users.id, id))
    .returning();
  return user || undefined;
}

export async function getAllUsers(): Promise<User[]> {
  return await db.select().from(users).orderBy(desc(users.createdAt));
}

export async function searchUsers(query: string): Promise<User[]> {
  return await db
    .select()
    .from(users)
    .where(
      or(
        like(users.firstName, `%${query}%`),
        like(users.lastName, `%${query}%`),
        like(users.email, `%${query}%`)
      )
    )
    .orderBy(desc(users.createdAt));
}

// Repair management
export async function createRepair(insertRepair: InsertRepair): Promise<Repair> {
  const [repair] = await db
    .insert(repairs)
    .values(insertRepair)
    .returning();
  return repair;
}

export async function getRepair(id: number): Promise<Repair | undefined> {
  const [repair] = await db.select().from(repairs).where(eq(repairs.id, id));
  return repair || undefined;
}

export async function getAllRepairs(
  limit: number = 50,
  offset: number = 0,
  statusFilter?: string,
  categoryFilter?: string,
  searchQuery?: string
): Promise<{ repairs: Repair[]; total: number }> {
  let whereConditions = [];

  if (statusFilter && statusFilter !== "all") {
    whereConditions.push(eq(repairs.status, statusFilter as any));
  }

  if (categoryFilter && categoryFilter !== "all") {
    whereConditions.push(eq(repairs.category, categoryFilter as any));
  }

  if (searchQuery) {
    whereConditions.push(
      or(
        like(repairs.description, `%${searchQuery}%`),
        like(repairs.room, `%${searchQuery}%`)
      )
    );
  }

  const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

  // Get total count
  const [{ count: totalCount }] = await db
    .select({ count: count() })
    .from(repairs)
    .where(whereClause);

  // Get repairs with pagination
  const repairsList = await db
    .select()
    .from(repairs)
    .where(whereClause)
    .orderBy(desc(repairs.createdAt))
    .limit(limit)
    .offset(offset);

  return {
    repairs: repairsList,
    total: totalCount,
  };
}

export async function updateRepair(id: number, updates: Partial<InsertRepair>): Promise<Repair | undefined> {
  const [repair] = await db
    .update(repairs)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(repairs.id, id))
    .returning();
  return repair || undefined;
}

export async function getRepairStats(): Promise<{
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
}> {
  const stats = await db
    .select({
      status: repairs.status,
      count: count(),
    })
    .from(repairs)
    .groupBy(repairs.status);

  const result = {
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
  };

  stats.forEach((stat) => {
    result.total += stat.count;
    if (stat.status === "pending") result.pending = stat.count;
    if (stat.status === "inProgress") result.inProgress = stat.count;
    if (stat.status === "completed") result.completed = stat.count;
  });

  return result;
}

export async function getRepairsByCategory(): Promise<Array<{ category: string; count: number }>> {
  return await db
    .select({
      category: repairs.category,
      count: count(),
    })
    .from(repairs)
    .groupBy(repairs.category);
}

export async function getRepairsByUrgency(): Promise<Array<{ urgency: string; count: number }>> {
  return await db
    .select({
      urgency: repairs.urgency,
      count: count(),
    })
    .from(repairs)
    .groupBy(repairs.urgency);
}

export async function getMonthlyRepairStats(): Promise<Array<{ month: string; count: number }>> {
  const monthlyStats = await db
    .select({
      month: sql<string>`TO_CHAR(created_at, 'YYYY-MM')`,
      count: count(),
    })
    .from(repairs)
    .groupBy(sql`TO_CHAR(created_at, 'YYYY-MM')`)
    .orderBy(sql`TO_CHAR(created_at, 'YYYY-MM')`);

  return monthlyStats;
}

// Notification management
export async function createNotification(insertNotification: InsertNotification): Promise<Notification> {
  const [notification] = await db
    .insert(notifications)
    .values(insertNotification)
    .returning();
  return notification;
}

export async function getUserNotifications(
  userId: string,
  limit: number = 20,
  unreadOnly: boolean = false
): Promise<Notification[]> {
  let whereConditions = [eq(notifications.userId, userId)];

  if (unreadOnly) {
    whereConditions.push(eq(notifications.read, false));
  }

  return await db
    .select()
    .from(notifications)
    .where(and(...whereConditions))
    .orderBy(desc(notifications.createdAt))
    .limit(limit);
}

export async function markNotificationAsRead(id: number): Promise<Notification | undefined> {
  const [notification] = await db
    .update(notifications)
    .set({ read: true, updatedAt: new Date() })
    .where(eq(notifications.id, id))
    .returning();
  return notification || undefined;
}

export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  await db
    .update(notifications)
    .set({ read: true, updatedAt: new Date() })
    .where(eq(notifications.userId, userId));
}

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  const [result] = await db
    .select({ count: count() })
    .from(notifications)
    .where(and(
      eq(notifications.userId, userId),
      eq(notifications.read, false)
    ));

  return result.count;
}