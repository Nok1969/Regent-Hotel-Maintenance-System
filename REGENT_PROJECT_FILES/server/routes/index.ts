import type { Express } from "express";
import { authRoutes } from "./auth";
import { repairRoutes } from "./repairs";
import { userRoutes } from "./users";
import { notificationRoutes } from "./notifications";
import { uploadRoutes } from "./uploads";

export function registerRoutes(
  app: Express,
  middleware: {
    requireAuth: any;
    requirePermission: (permission: string) => any;
  }
) {
  // Register all route modules
  authRoutes(app, middleware);
  repairRoutes(app, middleware);
  userRoutes(app, middleware);
  notificationRoutes(app, middleware);
  uploadRoutes(app, middleware);
}