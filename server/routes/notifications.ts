import type { Express } from "express";
import { storage } from "../storage";
import { customAuth } from "./auth";
import { 
  queryValidation,
  handleValidationErrors,
  asyncHandler 
} from "../middleware/security";
import { z } from "zod";

export function setupNotificationRoutes(app: Express) {
  // Get notifications for current user
  app.get("/api/notifications", 
    customAuth,
    queryValidation,
    handleValidationErrors,
    asyncHandler(async (req: any, res: any) => {
      const userId = req.user?.claims?.sub || req.session?.mockUser?.id;
      const { isRead, limit = 20, offset = 0 } = req.query;
      
      const filters: any = {};
      if (isRead !== undefined) {
        filters.isRead = isRead === 'true';
      }
      filters.limit = parseInt(limit);
      filters.offset = parseInt(offset);

      const notifications = await storage.getNotifications(userId, filters);
      res.json(notifications);
    })
  );

  // Mark notification as read
  app.patch("/api/notifications/:id/read", 
    customAuth,
    asyncHandler(async (req: any, res: any) => {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid notification ID" });
      }

      const userId = req.user?.claims?.sub || req.session?.mockUser?.id;
      const notification = await storage.markNotificationAsRead(id, userId);
      
      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }

      res.json(notification);
    })
  );

  // Mark all notifications as read
  app.patch("/api/notifications/read-all", 
    customAuth,
    asyncHandler(async (req: any, res: any) => {
      const userId = req.user?.claims?.sub || req.session?.mockUser?.id;
      const result = await storage.markAllNotificationsAsRead(userId);
      res.json(result);
    })
  );
}