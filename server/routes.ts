import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertRepairSchema, updateRepairSchema } from "@shared/schema";
import { hasPermission, getUserPermissions } from "./permissions";
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

  // Mock login for testing purposes
  app.post("/api/auth/mock-login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      // Mock users for testing different roles
      const mockUsers = {
        "admin": { id: "admin-123", role: "admin", password: "admin123" },
        "manager": { id: "manager-123", role: "manager", password: "manager123" },
        "staff": { id: "staff-123", role: "staff", password: "staff123" },
        "technician": { id: "tech-123", role: "technician", password: "tech123" }
      };

      const mockUser = mockUsers[username as keyof typeof mockUsers];
      if (!mockUser || mockUser.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Create or update user in database
      await storage.upsertUser({
        id: mockUser.id,
        email: `${username}@hotel.com`,
        firstName: username.charAt(0).toUpperCase() + username.slice(1),
        lastName: "User",
        profileImageUrl: null,
        role: mockUser.role as "admin" | "manager" | "staff" | "technician",
        language: "en"
      });

      // Set session
      (req as any).session.mockUser = {
        id: mockUser.id,
        role: mockUser.role,
        isAuthenticated: true
      };
      
      // Save session explicitly
      (req as any).session.save((err: any) => {
        if (err) {
          console.error('Session save error:', err);
        }
      });

      res.json({ success: true, role: mockUser.role });
    } catch (error) {
      console.error("Mock login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Auth routes
  app.get("/api/auth/user", async (req: any, res) => {
    try {
      // Check for mock session first
      if (req.session?.mockUser?.isAuthenticated) {
        const userId = req.session.mockUser.id;
        const user = await storage.getUser(userId);
        if (user) {
          const permissions = getUserPermissions(user.role as any);
          return res.json({ ...user, permissions });
        }
      }

      // Then check Replit auth
      if (!req.isAuthenticated() || !req.user?.claims?.sub) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (user) {
        const permissions = getUserPermissions(user.role as any);
        res.json({ ...user, permissions });
      } else {
        res.status(404).json({ message: "User not found" });
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Mock logout
  app.post("/api/auth/mock-logout", (req: any, res) => {
    if (req.session) {
      req.session.destroy((err: any) => {
        if (err) {
          console.error('Session destroy error:', err);
          return res.status(500).json({ error: 'Logout failed' });
        }
        res.clearCookie('connect.sid');
        res.json({ success: true });
      });
    } else {
      res.json({ success: true });
    }
  });

  // Get repair statistics
  app.get("/api/stats", isAuthenticated, async (req: any, res) => {
    try {
      const stats = await storage.getRepairStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  // Repair routes
  app.get("/api/repairs", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || req.session?.mockUser?.id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const permissions = getUserPermissions(user.role);
      const filters = {
        userId: permissions.canViewAllRepairs ? undefined : userId,
        status: req.query.status as string,
        category: req.query.category as string,
        limit: parseInt(req.query.limit as string) || undefined,
        offset: parseInt(req.query.offset as string) || undefined,
      };

      const repairs = await storage.getRepairs(filters);
      res.json(repairs);
    } catch (error) {
      console.error("Error fetching repairs:", error);
      res.status(500).json({ message: "Failed to fetch repairs" });
    }
  });

  app.post("/api/repairs", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || req.session?.mockUser?.id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const permissions = getUserPermissions(user.role);
      if (!permissions.canCreateRepairs) {
        return res.status(403).json({ message: "Permission denied" });
      }

      const repairData = {
        ...req.body,
        userId: userId,
        status: "pending",
      };

      const repair = await storage.createRepair(repairData);
      res.json(repair);
    } catch (error) {
      console.error("Error creating repair:", error);
      res.status(500).json({ message: "Failed to create repair" });
    }
  });

  app.patch("/api/repairs/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || req.session?.mockUser?.id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const permissions = getUserPermissions(user.role);
      if (!permissions.canUpdateRepairStatus) {
        return res.status(403).json({ message: "Permission denied" });
      }

      const repairId = parseInt(req.params.id);
      const updateData = {
        id: repairId,
        ...req.body,
      };

      const repair = await storage.updateRepair(updateData);
      res.json(repair);
    } catch (error) {
      console.error("Error updating repair:", error);
      res.status(500).json({ message: "Failed to update repair" });
    }
  });

  app.post("/api/repairs/:id/upload", isAuthenticated, upload.array("images", 5), async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || req.session?.mockUser?.id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const repairId = parseInt(req.params.id);
      const files = req.files as Express.Multer.File[];
      
      if (!files || files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
      }

      const filePaths = files.map(file => `/uploads/${file.filename}`);
      
      // In a real app, you'd store these paths in the database
      // For now, we'll just return the uploaded file paths
      res.json({ files: filePaths });
    } catch (error) {
      console.error("Error uploading files:", error);
      res.status(500).json({ message: "Failed to upload files" });
    }
  });

  // User management routes
  app.get("/api/users", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const currentUser = await storage.getUser(userId);
      
      if (!currentUser || !hasPermission(currentUser, 'canViewAllUsers')) {
        return res.status(403).json({ message: "Access denied" });
      }

      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.patch("/api/users/:userId/role", isAuthenticated, async (req: any, res) => {
    try {
      const currentUserId = req.user.claims.sub;
      const currentUser = await storage.getUser(currentUserId);
      
      if (!currentUser || !hasPermission(currentUser, 'canManageUsers')) {
        return res.status(403).json({ message: "Access denied" });
      }

      const { userId } = req.params;
      const { role } = req.body;

      if (!['admin', 'manager', 'staff', 'technician'].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }

      const updatedUser = await storage.updateUserRole(userId, role);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update user role" });
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
      const currentUser = await storage.getUser(userId);
      
      if (!currentUser || !hasPermission(currentUser, 'canCreateRepairs')) {
        return res.status(403).json({ message: "Access denied" });
      }

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
      const currentUser = await storage.getUser(userId);
      
      if (!currentUser || !hasPermission(currentUser, 'canViewAllRepairs')) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const { status, category, page = "1", limit = "10" } = req.query;
      const offset = (parseInt(page) - 1) * parseInt(limit);

      const filters: any = {
        limit: parseInt(limit),
        offset,
      };

      // Role-based filtering
      const permissions = getUserPermissions(currentUser.role as any);
      if (!permissions.canViewAllRepairs) {
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
      const currentUser = await storage.getUser(userId);
      const repairId = parseInt(req.params.id);

      if (!currentUser) {
        return res.status(401).json({ message: "User not found" });
      }

      const repair = await storage.getRepairById(repairId);
      if (!repair) {
        return res.status(404).json({ message: "Repair not found" });
      }

      // Role-based access check
      const permissions = getUserPermissions(currentUser.role as any);
      const isOwner = repair.userId === userId;
      
      if (!permissions.canViewAllRepairs && !isOwner) {
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
      const currentUser = await storage.getUser(userId);
      const repairId = parseInt(req.params.id);

      if (!currentUser) {
        return res.status(401).json({ message: "User not found" });
      }

      const repair = await storage.getRepairById(repairId);
      if (!repair) {
        return res.status(404).json({ message: "Repair not found" });
      }

      const permissions = getUserPermissions(currentUser.role as any);
      const isOwner = repair.userId === userId;

      // Check if user can update this repair
      if (!permissions.canViewAllRepairs && !isOwner) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Role-based status update permissions
      if (req.body.status && !hasPermission(currentUser, 'canUpdateRepairStatus')) {
        return res.status(403).json({ message: "You cannot change repair status" });
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
