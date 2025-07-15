import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertRepairSchema, updateRepairSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  dest: uploadDir,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Serve uploaded files
  app.use("/uploads", express.static(uploadDir));

  // Auth routes
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // File upload endpoint
  app.post("/api/upload", isAuthenticated, upload.array("images", 5), async (req, res) => {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
      }

      const fileUrls = files.map(file => `/uploads/${file.filename}`);
      res.json({ urls: fileUrls });
    } catch (error) {
      console.error("Error uploading files:", error);
      res.status(500).json({ message: "Failed to upload files" });
    }
  });

  // Repair routes
  app.post("/api/repairs", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const repairData = insertRepairSchema.parse({
        ...req.body,
        userId,
      });

      const repair = await storage.createRepair(repairData);
      res.status(201).json(repair);
    } catch (error) {
      console.error("Error creating repair:", error);
      res.status(400).json({ message: "Failed to create repair request" });
    }
  });

  app.get("/api/repairs", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      const { status, category, page = "1", limit = "10" } = req.query;
      const offset = (parseInt(page) - 1) * parseInt(limit);

      const filters: any = {
        limit: parseInt(limit),
        offset,
      };

      // Non-admin users can only see their own repairs
      if (user?.role !== "admin") {
        filters.userId = userId;
      }

      if (status) filters.status = status;
      if (category) filters.category = category;

      const repairs = await storage.getRepairs(filters);
      res.json(repairs);
    } catch (error) {
      console.error("Error fetching repairs:", error);
      res.status(500).json({ message: "Failed to fetch repairs" });
    }
  });

  app.get("/api/repairs/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const repairId = parseInt(req.params.id);

      const repair = await storage.getRepairById(repairId);
      if (!repair) {
        return res.status(404).json({ message: "Repair not found" });
      }

      // Non-admin users can only see their own repairs
      if (user?.role !== "admin" && repair.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(repair);
    } catch (error) {
      console.error("Error fetching repair:", error);
      res.status(500).json({ message: "Failed to fetch repair" });
    }
  });

  app.patch("/api/repairs/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const repairId = parseInt(req.params.id);

      const repair = await storage.getRepairById(repairId);
      if (!repair) {
        return res.status(404).json({ message: "Repair not found" });
      }

      // Only admin can change status, users can only edit their own repairs
      const isOwner = repair.userId === userId;
      const isAdmin = user?.role === "admin";

      if (!isOwner && !isAdmin) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Non-admin users cannot change status
      if (!isAdmin && req.body.status) {
        delete req.body.status;
      }

      const updateData = updateRepairSchema.parse({
        id: repairId,
        ...req.body,
      });

      const updatedRepair = await storage.updateRepair(updateData);
      res.json(updatedRepair);
    } catch (error) {
      console.error("Error updating repair:", error);
      res.status(400).json({ message: "Failed to update repair" });
    }
  });

  // Stats endpoint
  app.get("/api/stats", isAuthenticated, async (req: any, res) => {
    try {
      const stats = await storage.getRepairStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
