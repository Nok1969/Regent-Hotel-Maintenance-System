import type { Express } from "express";
import { storage } from "../storage";
import { customAuth } from "./auth";
import { 
  repairValidation, 
  updateRepairValidation, 
  queryValidation, 
  handleValidationErrors,
  asyncHandler 
} from "../middleware/security";
import {
  insertRepairSchema,
  backendRepairSchema,
  updateRepairSchema,
  repairFiltersSchema,
  type InsertRepair,
  type UpdateRepair
} from "@shared/schema";
import { hasPermission, getUserPermissions } from "../permissions";
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

export function setupRepairRoutes(app: Express) {
  // Get repair statistics summary
  app.get("/api/stats/summary", 
    customAuth,
    queryValidation,
    handleValidationErrors,
    asyncHandler(async (req: any, res: any) => {
      const stats = await storage.getRepairStats();
      res.json(stats);
    })
  );

  // Get monthly statistics
  app.get("/api/stats/monthly", 
    customAuth,
    queryValidation,
    handleValidationErrors,
    asyncHandler(async (req: any, res: any) => {
      const monthlyStats = await storage.getMonthlyStats();
      res.json(monthlyStats);
    })
  );

  // Legacy stats endpoint (kept for backward compatibility)
  app.get("/api/stats", customAuth, asyncHandler(async (req: any, res: any) => {
    const stats = await storage.getRepairStats();
    res.json(stats);
  }));

  // Repair routes with proper validation
  app.get("/api/repairs", 
    customAuth, 
    validateSchema(repairFiltersSchema, 'query'),
    asyncHandler(async (req: any, res: any) => {
      const userId = req.user?.claims?.sub || req.session?.mockUser?.id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const permissions = getUserPermissions(user.role);
      const { status, category, limit = 10, offset = 0 } = req.query;
      
      // Role-based filtering logic
      let filters: any = {};
      
      if (permissions.canViewAllRepairs) {
        // Admin/Manager/Technician can see all repairs
        if (status) filters.status = status;
        if (category) filters.category = category;
      } else {
        // Staff can only see their own repairs
        filters.userId = userId;
        if (status) filters.status = status;
        if (category) filters.category = category;
      }
      
      const repairs = await storage.getRepairs({
        ...filters,
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
      
      res.json(repairs);
    })
  );

  app.get("/api/repairs/:id", 
    customAuth, 
    asyncHandler(async (req: any, res: any) => {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid repair ID" });
      }

      const repair = await storage.getRepairById(id);
      if (!repair) {
        return res.status(404).json({ message: "Repair not found" });
      }

      const userId = req.user?.claims?.sub || req.session?.mockUser?.id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const permissions = getUserPermissions(user.role);
      
      // Check permissions: users can see their own repairs, admin/manager/technician can see all
      if (!permissions.canViewAllRepairs && repair.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(repair);
    })
  );

  app.post("/api/repairs", 
    customAuth, 
    validateSchema(backendRepairSchema),
    asyncHandler(async (req: any, res: any) => {
      const userId = req.user?.claims?.sub || req.session?.mockUser?.id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const permissions = getUserPermissions(user.role);
      if (!permissions.canCreateRepairs) {
        return res.status(403).json({ message: "Permission denied" });
      }

      const repairData: InsertRepair = {
        ...req.body,
        userId: userId,
      };

      const newRepair = await storage.createRepair(repairData);

      // Create notifications for admin/manager/technician users about the new repair
      const allUsers = await storage.getAllUsers();
      const notificationUsers = allUsers.filter(u => 
        u.role === 'admin' || u.role === 'manager' || u.role === 'technician'
      );

      // Create notifications for each admin/manager/technician
      for (const notifUser of notificationUsers) {
        await storage.createNotification({
          userId: notifUser.id,
          title: `มีงานซ่อมใหม่เข้ามา`,
          description: `${user.name || 'ผู้ใช้'} ได้ส่งคำขอซ่อมใหม่ ห้อง ${newRepair.room} ประเภท ${newRepair.category}`,
          type: "new_request",
          relatedId: newRepair.id,
        });
      }

      res.status(201).json(newRepair);
    })
  );

  app.patch("/api/repairs/:id", 
    customAuth, 
    validateSchema(updateRepairSchema),
    asyncHandler(async (req: any, res: any) => {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid repair ID" });
      }

      const userId = req.user?.claims?.sub || req.session?.mockUser?.id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const permissions = getUserPermissions(user.role);
      if (!permissions.canUpdateRepairStatus) {
        return res.status(403).json({ message: "Permission denied" });
      }

      const existingRepair = await storage.getRepairById(id);
      if (!existingRepair) {
        return res.status(404).json({ message: "Repair not found" });
      }

      const updateData: UpdateRepair = { id, ...req.body };
      const updatedRepair = await storage.updateRepair(updateData);

      // Create notifications based on status change
      if (req.body.status && req.body.status !== existingRepair.status) {
        // Status update notifications
        if (req.body.status === 'completed') {
          // Notify original requester when repair is completed
          await storage.createNotification({
            userId: existingRepair.userId,
            title: `งานซ่อมที่ห้อง ${existingRepair.room} เสร็จสิ้นแล้ว`,
            description: `งานซ่อม${existingRepair.category}ที่คุณแจ้งได้รับการซ่อมแซมเสร็จเรียบร้อยแล้ว โดย ${user.name || 'ช่างเทคนิค'}`,
            type: "completed",
            relatedId: id,
          });
        } else if (req.body.status === 'in_progress') {
          // Notify original requester when repair starts
          await storage.createNotification({
            userId: existingRepair.userId,
            title: `งานซ่อมของคุณได้รับการตอบรับแล้ว`,
            description: `${user.name || 'ช่างเทคนิค'} ได้รับงานซ่อมห้อง ${existingRepair.room} แล้ว`,
            type: "assigned",
            relatedId: id,
          });
        }
      }

      res.json(updatedRepair);
    })
  );
}