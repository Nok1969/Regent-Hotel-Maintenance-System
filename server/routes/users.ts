import type { Express } from "express";
import { storage } from "../storage";
import { customAuth } from "./auth";
import { 
  userValidation,
  handleValidationErrors,
  asyncHandler 
} from "../middleware/security";
import {
  userFiltersSchema,
  updateUserRoleSchema,
  type UserFilters
} from "@shared/schema";
import { getUserPermissions } from "../permissions";
import { z } from "zod";

// Validation middleware
const validateSchema = (schema: any, target: 'body' | 'query' = 'body') => {
  return (req: any, res: any, next: any) => {
    try {
      const data = target === 'body' ? req.body : req.query;
      schema.parse(data);
      next();
    } catch (error: any) {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors || [{ message: error.message }]
      });
    }
  };
};

export function setupUserRoutes(app: Express) {
  // Get all users with filtering
  app.get("/api/users", 
    customAuth,
    validateSchema(userFiltersSchema, 'query'),
    asyncHandler(async (req: any, res: any) => {
      const currentUserId = req.user?.claims?.sub || req.session?.mockUser?.id;
      const currentUser = await storage.getUser(currentUserId);
      
      if (!currentUser) {
        return res.status(404).json({ message: "User not found" });
      }

      const permissions = getUserPermissions(currentUser.role);
      if (!permissions.canViewAllUsers) {
        return res.status(403).json({ message: "Permission denied" });
      }

      const users = await storage.getAllUsers();
      
      // Remove passwords from response
      const safeUsers = users.map(({ password, ...user }) => user);
      
      res.json(safeUsers);
    })
  );

  // Create new user (admin only)
  app.post("/api/users", 
    customAuth,
    validateSchema(z.object({
      name: z.string()
        .min(2, "ชื่อต้องมีอย่างน้อย 2 ตัวอักษร")
        .max(100, "ชื่อต้องไม่เกิน 100 ตัวอักษร")
        .regex(/^[a-zA-Zก-๙\s]+$/, "ชื่อต้องเป็นตัวอักษรและช่องว่างเท่านั้น"),
      email: z.string()
        .email("รูปแบบอีเมลไม่ถูกต้อง")
        .max(255, "อีเมลต้องไม่เกิน 255 ตัวอักษร"),
      password: z.string()
        .min(8, "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร")
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "รหัสผ่านต้องมีตัวอักษรเล็ก ตัวอักษรใหญ่ และตัวเลข"),
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      role: z.enum(["admin", "manager", "staff", "technician"]),
      language: z.enum(["en", "th"]).default("en"),
    })),
    asyncHandler(async (req: any, res: any) => {
      const currentUserId = req.user?.claims?.sub || req.session?.mockUser?.id;
      const currentUser = await storage.getUser(currentUserId);
      
      if (!currentUser) {
        return res.status(404).json({ message: "User not found" });
      }

      const permissions = getUserPermissions(currentUser.role);
      if (!permissions.canManageUsers) {
        return res.status(403).json({ message: "Permission denied" });
      }

      const { name, email, password, firstName, lastName, role, language } = req.body;

      // Check if email already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ message: "Email already exists" });
      }

      const newUser = await storage.createUserWithPassword({
        name: name,
        email: email,
        password: password,
        firstName: firstName,
        lastName: lastName,
        role: role,
        language: language,
      });

      // Create notification for new user addition to all admin/manager users
      const allUsers = await storage.getAllUsers();
      const adminUsers = allUsers.filter(user => 
        user.role === 'admin' || user.role === 'manager'
      );

      // Create notification for each admin/manager
      for (const adminUser of adminUsers) {
        await storage.createNotification({
          userId: adminUser.id,
          title: `เพิ่มผู้ใช้งานใหม่: ${newUser.name}`,
          description: `${currentUser.name || 'ผู้ดูแลระบบ'} ได้เพิ่มผู้ใช้งาน ${role} ใหม่: ${newUser.name} (${newUser.email})`,
          type: "new_request",
        });
      }

      // Don't return password in response
      const { password: _, ...userResponse } = newUser;
      res.status(201).json(userResponse);
    })
  );

  // Update user role
  app.patch("/api/users/:userId/role", 
    customAuth,
    validateSchema(z.object({
      role: z.enum(["admin", "manager", "staff", "technician"])
    })),
    asyncHandler(async (req: any, res: any) => {
      const currentUserId = req.user?.claims?.sub || req.session?.mockUser?.id;
      const currentUser = await storage.getUser(currentUserId);
      
      if (!currentUser) {
        return res.status(404).json({ message: "User not found" });
      }

      const permissions = getUserPermissions(currentUser.role);
      if (!permissions.canManageUsers) {
        return res.status(403).json({ message: "Permission denied" });
      }

      const { userId } = req.params;
      const { role } = req.body;

      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      const updatedUser = await storage.updateUserRole(userId, role);
      res.json(updatedUser);
    })
  );
}