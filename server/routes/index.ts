import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { setupAuth, isAuthenticated } from "../replitAuth";
import { setupAuthRoutes } from "./auth";
import { setupRepairRoutes } from "./repairs";
import { setupUserRoutes } from "./users";
import { setupNotificationRoutes } from "./notifications";
import { setupUploadRoutes } from "./uploads";
import cookieParser from "cookie-parser";

export default function registerRoutes(app: Express): Server {
  app.use(cookieParser());
  
  // Setup authentication
  setupAuth(app);
  
  // Setup all route modules
  setupAuthRoutes(app);
  setupRepairRoutes(app);
  setupUserRoutes(app);
  setupNotificationRoutes(app);
  setupUploadRoutes(app);

  // Serve uploaded files statically with cache headers
  app.use("/uploads", express.static("uploads", {
    maxAge: "1d",
    etag: false
  }));

  // Allow root path without authentication to show the Landing page
  // The frontend will handle authentication state internally

  // Legacy logout route
  app.get("/api/logout", (req: any, res) => {
    if (req.session) {
      req.session.destroy((err: any) => {
        if (err) {
          console.error('Session destroy error:', err);
          return res.status(500).json({ error: 'Logout failed' });
        }
        res.clearCookie('connect.sid');
        res.redirect("/api/login");
      });
    } else {
      res.redirect("/api/login");
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}