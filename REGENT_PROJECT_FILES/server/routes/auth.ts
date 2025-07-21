import type { Express } from "express";
import { body, validationResult } from "express-validator";
import { getUser } from "../storage";

export function authRoutes(
  app: Express,
  { requireAuth }: { requireAuth: any; requirePermission: (permission: string) => any }
) {
  // Get current user
  app.get("/api/auth/user", requireAuth, async (req, res) => {
    try {
      res.json(req.user);
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  // Check authentication status
  app.get("/api/auth/check", async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ authenticated: false });
      }

      const user = await getUser(parseInt(userId));
      if (!user) {
        return res.status(401).json({ authenticated: false });
      }

      res.json({ authenticated: true, user });
    } catch (error) {
      console.error("Auth check error:", error);
      res.status(500).json({ authenticated: false, message: "Auth check failed" });
    }
  });
}