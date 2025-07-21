import type { Express } from "express";
import { query, validationResult } from "express-validator";
import { 
  getUserNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead,
  getUnreadNotificationCount 
} from "../storage";

export function notificationRoutes(
  app: Express,
  { requireAuth, requirePermission }: { requireAuth: any; requirePermission: (permission: string) => any }
) {
  // Get user notifications
  app.get("/api/notifications", [
    requireAuth,
    requirePermission("notifications:read"),
    query("limit").optional().isInt({ min: 1, max: 50 }),
    query("unreadOnly").optional().isBoolean(),
  ], async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const limit = parseInt(req.query.limit as string) || 20;
      const unreadOnly = req.query.unreadOnly === "true";
      const userId = req.user.id.toString();

      const notifications = await getUserNotifications(userId, limit, unreadOnly);
      res.json(notifications);
    } catch (error) {
      console.error("Get notifications error:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  // Get unread notification count
  app.get("/api/notifications/unread-count", [
    requireAuth,
    requirePermission("notifications:read"),
  ], async (req, res) => {
    try {
      const userId = req.user.id.toString();
      const count = await getUnreadNotificationCount(userId);
      res.json({ count });
    } catch (error) {
      console.error("Get unread count error:", error);
      res.status(500).json({ message: "Failed to fetch unread count" });
    }
  });

  // Mark notification as read
  app.patch("/api/notifications/:id/read", [
    requireAuth,
    requirePermission("notifications:read"),
  ], async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid notification ID" });
      }

      const notification = await markNotificationAsRead(id);
      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }

      res.json(notification);
    } catch (error) {
      console.error("Mark notification read error:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  // Mark all notifications as read
  app.patch("/api/notifications/read-all", [
    requireAuth,
    requirePermission("notifications:read"),
  ], async (req, res) => {
    try {
      const userId = req.user.id.toString();
      await markAllNotificationsAsRead(userId);
      res.json({ message: "All notifications marked as read" });
    } catch (error) {
      console.error("Mark all notifications read error:", error);
      res.status(500).json({ message: "Failed to mark all notifications as read" });
    }
  });
}