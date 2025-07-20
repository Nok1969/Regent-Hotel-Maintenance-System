import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  repairValidation, 
  updateRepairValidation, 
  queryValidation, 
  userValidation,
  handleValidationErrors,
  asyncHandler,
  uploadLimiter 
} from "./middleware/security";
import {
  insertRepairSchema,
  backendRepairSchema,
  updateRepairSchema,
  repairFiltersSchema,
  userFiltersSchema,
  updateUserRoleSchema,
  type InsertRepair,
  type UpdateRepair,
  type Repair,
  type User,
  type RepairFilters,
  type UserFilters,
  type Role,
  type PaginatedResponse,
  type ApiResponse,
} from "@shared/schema";
import { hasPermission, getUserPermissions } from "./permissions";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";
import cookieParser from "cookie-parser";

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Improved file upload configuration with better error handling
const upload = multer({
  dest: uploadDir,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 5, // Maximum 5 files
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      // Return standardized error instead of throwing
      const error = new Error("Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.");
      (error as any).code = "INVALID_FILE_TYPE";
      return cb(error, false);
    }
  },
});

// File upload error handler middleware
const handleUploadError = (err: any, req: any, res: any, next: any) => {
  if (err) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ 
        message: "File size too large. Maximum size is 5MB." 
      });
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({ 
        message: "Too many files. Maximum 5 files allowed." 
      });
    }
    if (err.code === "INVALID_FILE_TYPE") {
      return res.status(400).json({ 
        message: "Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed." 
      });
    }
    return res.status(400).json({ 
      message: "File upload error: " + err.message 
    });
  }
  next();
};

// Validation middleware
const validateSchema = (schema: any) => {
  return (req: any, res: any, next: any) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error: any) {
      return res.status(400).json({
        message: "Validation failed",
        errors: error.errors || [{ message: error.message }]
      });
    }
  };
};

// Async error wrapper
const asyncHandler = (fn: Function) => {
  return (req: any, res: any, next: any) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Input sanitization
const sanitizeInput = (req: any, res: any, next: any) => {
  // Basic XSS protection
  const sanitize = (obj: any): any => {
    if (typeof obj === 'string') {
      return obj.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    }
    if (typeof obj === 'object' && obj !== null) {
      const sanitized: any = {};
      for (const key in obj) {
        sanitized[key] = sanitize(obj[key]);
      }
      return sanitized;
    }
    return obj;
  };

  if (req.body) {
    req.body = sanitize(req.body);
  }
  if (req.query) {
    req.query = sanitize(req.query);
  }
  next();
};

// Remove global state - use session-based authentication only

// Custom authentication middleware that supports both session and Replit auth
const customAuth = (req: any, res: any, next: any) => {
  // Check session-based authentication first
  if (req.session?.mockUser?.isAuthenticated) {
    return next();
  }
  
  // Check Replit auth
  if (req.isAuthenticated && req.isAuthenticated() && req.user?.claims?.sub) {
    return next();
  }
  
  return res.status(401).json({ message: "Unauthorized" });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Apply input sanitization to all routes
  app.use(sanitizeInput);
  
  // Auth middleware
  await setupAuth(app);
  
  // Add cookie parser middleware
  app.use(cookieParser());

  // Serve uploaded files
  app.use("/uploads", express.static(uploadDir));

  // Mock login for testing purposes
  app.post("/api/auth/mock-login", 
    validateSchema(z.object({
      username: z.string().min(1, "Username is required"),
      password: z.string().min(1, "Password is required")
    })),
    asyncHandler(async (req: any, res: any) => {
      const { username, password } = req.body;
      
      // Mock users for testing different roles
      const mockUsers = {
        "admin": { id: "admin-123", role: "admin", password: "admin123" },
        "manager": { id: "manager-123", role: "manager", password: "manager123" },
        "staff": { id: "staff-123", role: "staff", password: "staff123" },
        "technician": { id: "tech-123", role: "technician", password: "tech123" }
      };

      const mockUser = mockUsers[username as keyof typeof mockUsers];
      
      if (!mockUser) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // For existing mock users, verify password using bcrypt if stored password is hashed
      const user = await storage.getUser(mockUser.id);
      if (user?.password) {
        const isValidPassword = await storage.verifyPassword(mockUser.id, password);
        if (!isValidPassword) {
          return res.status(401).json({ message: "Invalid credentials" });
        }
      } else if (mockUser.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Create or update user in database with hashed password
      const existingUser = await storage.getUser(mockUser.id);
      if (!existingUser) {
        await storage.createUserWithPassword({
          name: `${username.charAt(0).toUpperCase() + username.slice(1)} User`,
          email: `${username}@hotel.com`,
          password: mockUser.password,
          firstName: username.charAt(0).toUpperCase() + username.slice(1),
          lastName: "User",
          role: mockUser.role,
          language: "en"
        });
      }

      // Store user info in session instead of global variable
      req.session.mockUser = {
        id: mockUser.id,
        role: mockUser.role,
        isAuthenticated: true,
        timestamp: Date.now()
      };

      console.log('Login successful for user:', mockUser.id);

      // Always return JSON for API requests
      res.json({ success: true, role: mockUser.role });
    })
  );

  // Logout route
  app.post("/api/auth/logout", (req: any, res: any) => {
    if (req.session) {
      req.session.destroy((err: any) => {
        if (err) {
          console.error('Session destruction error:', err);
          return res.status(500).json({ message: "Logout failed" });
        }
        res.json({ success: true });
      });
    } else {
      res.json({ success: true });
    }
  });

  // Auth routes
  app.get("/api/auth/user", asyncHandler(async (req: any, res: any) => {
    // Check for session-based authentication first
    if (req.session?.mockUser?.isAuthenticated) {
      const userId = req.session.mockUser.id;
      const user = await storage.getUser(userId);
      if (user) {
        const permissions = getUserPermissions(user.role as any);
        return res.json({ ...user, permissions });
      }
    }

    // Then check Replit auth
    if (!req.isAuthenticated || !req.isAuthenticated() || !req.user?.claims?.sub) {
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
  }));

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
      
      const filters = {
        userId: permissions.canViewAllRepairs ? undefined : userId,
        status: req.query.status,
        category: req.query.category,
        urgency: req.query.urgency,
        search: req.query.search,
        limit: req.query.limit,
        offset: req.query.offset,
      };

      const repairs = await storage.getRepairs(filters);
      res.json(repairs);
    })
  );

  app.post("/api/repairs", 
    customAuth,
    validateSchema(z.object({
      title: z.string().min(3, "Title must be at least 3 characters"),
      description: z.string().min(10, "Description must be at least 10 characters"),
      category: z.enum(["electrical", "plumbing", "hvac", "furniture", "other"]),
      urgency: z.enum(["high", "medium", "low"]),
      location: z.string().min(3, "Location must be at least 3 characters"),
    }).refine((data) => {
      if (data.urgency === "high" && data.description.length < 20) {
        return false;
      }
      return true;
    }, {
      message: "High urgency repairs require detailed description (min 20 characters)",
      path: ["description"],
    })),
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

      // Transform frontend data to backend format
      const repairData = {
        room: req.body.location, // Map location to room for backend
        description: req.body.description,
        category: req.body.category,
        urgency: req.body.urgency,
        userId: userId,
        status: "pending",
        images: [],
      };

      const repair = await storage.createRepair(repairData);

      // Create notification for new repair request to all admin/manager/technician users
      const allUsers = await storage.getAllUsers();
      const notifyUsers = allUsers.filter(user => 
        user.role === 'admin' || user.role === 'manager' || user.role === 'technician'
      );

      // Get current user info for notification
      const currentUser = await storage.getUser(userId);
      const userName = currentUser?.name || `${currentUser?.firstName} ${currentUser?.lastName}` || 'Unknown User';

      // Create notification for each admin/manager/technician  
      const categoryMap = {
        electrical: "ไฟฟ้า",
        plumbing: "ประปา", 
        hvac: "เครื่องปรับอากาศ",
        furniture: "เฟอร์นิเจอร์",
        other: "อื่นๆ"
      };
      
      const urgencyMap = {
        high: "สูง",
        medium: "ปานกลาง", 
        low: "ต่ำ"
      };

      for (const notifyUser of notifyUsers) {
        await storage.createNotification({
          userId: notifyUser.id,
          title: `มีงานซ่อมใหม่เข้ามา`,
          description: `${userName} ส่งคำขอซ่อม${categoryMap[req.body.category] || req.body.category} ความเร่งด่วน${urgencyMap[req.body.urgency] || req.body.urgency} ที่ห้อง ${req.body.location}`,
          type: "new_request",
          relatedId: repair.id,
        });
      }

      res.json(repair);
    })
  );

  app.patch("/api/repairs/:id", 
    customAuth,
    validateSchema(z.object({
      title: z.string().min(3, "Title must be at least 3 characters").optional(),
      description: z.string().min(10, "Description must be at least 10 characters").optional(),
      category: z.enum(["electrical", "plumbing", "hvac", "furniture", "other"]).optional(),
      urgency: z.enum(["high", "medium", "low"]).optional(),
      location: z.string().min(3, "Location must be at least 3 characters").optional(),
      status: z.enum(["pending", "in_progress", "completed"]).optional(),
      room: z.string().min(3, "Room must be at least 3 characters").optional(),
      assignedTo: z.string().nullable().optional(),
    }).refine((data) => {
      if (data.urgency === "high" && data.description && data.description.length < 20) {
        return false;
      }
      return true;
    }, {
      message: "High urgency repairs require detailed description (min 20 characters)",
      path: ["description"],
    })),
    asyncHandler(async (req: any, res: any) => {
      const userId = req.user?.claims?.sub || req.session?.mockUser?.id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const repairId = parseInt(req.params.id);
      if (isNaN(repairId)) {
        return res.status(400).json({ message: "Invalid repair ID" });
      }

      const { status, assignedTo, ...otherUpdateData } = req.body;
      const permissions = getUserPermissions(user.role);

      // Handle specific job actions (accept/cancel) vs general updates
      if (status && assignedTo !== undefined) {
        // Job accept/cancel actions
        if (status === "in_progress" && assignedTo) {
          // Accepting a job
          if (!permissions.canAcceptJobs) {
            return res.status(403).json({ message: "Insufficient permissions to accept jobs" });
          }
        } else if (status === "pending" && assignedTo === null) {
          // Cancelling a job
          if (!permissions.canCancelJobs) {
            return res.status(403).json({ message: "Insufficient permissions to cancel jobs" });
          }
        }
        
        // Use updateRepairStatus for status changes with assignment
        const repair = await storage.updateRepairStatus(repairId, status, assignedTo);
        
        // Create notification for job acceptance/cancellation
        if (status === "in_progress" && assignedTo) {
          // Job accepted - notify original requester
          const repairWithUser = await storage.getRepairById(repairId);
          if (repairWithUser) {
            const assignedUser = await storage.getUser(assignedTo);
            const technicianName = assignedUser?.name || `${assignedUser?.firstName} ${assignedUser?.lastName}` || 'Technician';
            
            const categoryMap = {
              electrical: "ไฟฟ้า",
              plumbing: "ประปา", 
              hvac: "เครื่องปรับอากาศ",
              furniture: "เฟอร์นิเจอร์",
              other: "อื่นๆ"
            };

            await storage.createNotification({
              userId: repairWithUser.userId,
              title: `งานซ่อมของคุณได้รับการตอบรับแล้ว`,
              description: `${technicianName} ได้รับงานซ่อม${categoryMap[repairWithUser.category] || repairWithUser.category} ของคุณที่ห้อง ${repairWithUser.room} แล้ว`,
              type: "assigned",
              relatedId: repairId,
            });
          }
        } else if (status === "pending" && assignedTo === null) {
          // Job cancelled - notify original requester
          const repairWithUser = await storage.getRepairById(repairId);
          if (repairWithUser) {
            const categoryMap = {
              electrical: "ไฟฟ้า",
              plumbing: "ประปา", 
              hvac: "เครื่องปรับอากาศ",
              furniture: "เฟอร์นิเจอร์",
              other: "อื่นๆ"
            };

            await storage.createNotification({
              userId: repairWithUser.userId,
              title: `สถานะงานซ่อมได้รับการอัปเดต`,
              description: `งานซ่อม${categoryMap[repairWithUser.category] || repairWithUser.category} ของคุณที่ห้อง ${repairWithUser.room} กลับไปเป็นสถานะรอดำเนินการแล้ว`,
              type: "status_update",
              relatedId: repairId,
            });
          }
        }
        
        return res.json(repair);
      } else if (status && !assignedTo) {
        // Regular status update
        if (!permissions.canUpdateRepairStatus) {
          return res.status(403).json({ message: "Insufficient permissions to update status" });
        }
        
        const repair = await storage.updateRepairStatus(repairId, status);
        
        // Create notification for status updates
        if (status === "completed") {
          // Get the repair with user info to notify the original requester
          const repairWithUser = await storage.getRepairById(repairId);
          if (repairWithUser) {
            const categoryMap = {
              electrical: "ไฟฟ้า",
              plumbing: "ประปา", 
              hvac: "เครื่องปรับอากาศ",
              furniture: "เฟอร์นิเจอร์",
              other: "อื่นๆ"
            };

            await storage.createNotification({
              userId: repairWithUser.userId,
              title: `งานซ่อมที่ห้อง ${repairWithUser.room} เสร็จสิ้นแล้ว`,
              description: `งานซ่อม${categoryMap[repairWithUser.category] || repairWithUser.category} ของคุณได้รับการซ่อมแซมเรียบร้อยแล้วโดยทีมช่าง`,
              type: "completed",
              relatedId: repairId,
            });
          }
        }
        
        return res.json(repair);
      } else {
        // General repair update (other fields)
        if (!permissions.canUpdateRepairStatus) {
          return res.status(403).json({ message: "Permission denied" });
        }

        const updateData = {
          id: repairId,
          ...otherUpdateData,
        };

        const repair = await storage.updateRepair(updateData);
        res.json(repair);
      }
    })
  );

  app.post("/api/repairs/:id/upload", 
    customAuth, 
    upload.array("images", 5), 
    handleUploadError,
    asyncHandler(async (req: any, res: any) => {
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
    })
  );

  // User management routes
  app.get("/api/users", customAuth, asyncHandler(async (req: any, res: any) => {
    const userId = req.user?.claims?.sub || req.session?.mockUser?.id;
    const currentUser = await storage.getUser(userId);
    
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const permissions = getUserPermissions(currentUser.role);
    if (!permissions.canViewAllUsers) {
      return res.status(403).json({ message: "Permission denied" });
    }

    const users = await storage.getAllUsers();
    res.json(users);
  }));

  // Add new user route
  app.post("/api/users", 
    customAuth,
    validateSchema(z.object({
      name: z.string()
        .min(2, "Name must be at least 2 characters")
        .max(100, "Name must be less than 100 characters")
        .regex(/^[a-zA-Zก-ฮ0-9\s]+$/, "Name can only contain letters, numbers and spaces"),
      email: z.string()
        .email("Please enter a valid email address")
        .max(255, "Email must be less than 255 characters"),
      password: z.string()
        .min(6, "Password must be at least 6 characters"),
      firstName: z.string()
        .min(1, "First name is required")
        .max(50, "First name must be less than 50 characters")
        .regex(/^[a-zA-Zก-ฮ0-9]+$/, "First name can only contain letters and numbers"),
      lastName: z.string()
        .min(1, "Last name is required")
        .max(50, "Last name must be less than 50 characters")
        .regex(/^[a-zA-Zก-ฮ0-9]+$/, "Last name can only contain letters and numbers"),
      role: z.enum(["admin", "manager", "staff", "technician"]),
      language: z.enum(["en", "th"]).default("en"),
    })),
    asyncHandler(async (req: any, res: any) => {
      const userId = req.user?.claims?.sub || req.session?.mockUser?.id;
      const currentUser = await storage.getUser(userId);
      
      if (!currentUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check if user has permission to manage users (only admin can add users)
      const permissions = getUserPermissions(currentUser.role);
      if (!permissions.canManageUsers) {
        return res.status(403).json({ 
          message: "Access denied. Only administrators can create new users." 
        });
      }

      const { name, email, password, firstName, lastName, role, language } = req.body;
      
      // Check if email already exists
      const existingEmailUser = await storage.getUserByEmail(email);
      if (existingEmailUser) {
        return res.status(400).json({ message: "Email already exists" });
      }

      // Create new user with hashed password
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

  // File upload endpoint
  app.post("/api/upload", 
    customAuth, 
    upload.array("images", 5), 
    handleUploadError,
    asyncHandler(async (req: any, res: any) => {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
      }

      const fileUrls = files.map(file => `/uploads/${file.filename}`);
      res.json({ urls: fileUrls });
    })
  );

  // Notification endpoints
  app.get("/api/notifications", 
    customAuth,
    asyncHandler(async (req: any, res: any) => {
      const userId = req.user?.claims?.sub || req.session?.mockUser?.id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const { isRead, limit = 20, offset = 0 } = req.query;
      const notifications = await storage.getNotifications(userId, {
        isRead: isRead === 'true' ? true : isRead === 'false' ? false : undefined,
        limit: parseInt(limit as string) || 20,
        offset: parseInt(offset as string) || 0,
      });

      res.json(notifications);
    })
  );

  app.patch("/api/notifications/:id/read", 
    customAuth,
    asyncHandler(async (req: any, res: any) => {
      const userId = req.user?.claims?.sub || req.session?.mockUser?.id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const notificationId = parseInt(req.params.id);
      if (isNaN(notificationId)) {
        return res.status(400).json({ message: "Invalid notification ID" });
      }

      const notification = await storage.markNotificationAsRead(notificationId, userId);
      res.json(notification);
    })
  );

  app.patch("/api/notifications/read-all", 
    customAuth,
    asyncHandler(async (req: any, res: any) => {
      const userId = req.user?.claims?.sub || req.session?.mockUser?.id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const result = await storage.markAllNotificationsAsRead(userId);
      res.json(result);
    })
  );

  const httpServer = createServer(app);
  return httpServer;
}