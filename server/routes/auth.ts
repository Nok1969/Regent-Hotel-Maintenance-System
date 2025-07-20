import type { Express } from "express";
import { storage } from "../storage";
import { z } from "zod";
import { asyncHandler, handleValidationErrors } from "../middleware/security";
import { getUserPermissions } from "../permissions";

// Custom authentication middleware for session-based auth
const customAuth = (req: any, res: any, next: any) => {
  if (req.session?.mockUser?.isAuthenticated) {
    return next();
  }
  if (req.isAuthenticated && req.isAuthenticated() && req.user?.claims?.sub) {
    return next();
  }
  return res.status(401).json({ message: "Unauthorized" });
};

export function setupAuthRoutes(app: Express) {
  // Mock login for testing
  app.post("/api/auth/mock-login", 
    handleValidationErrors,
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

  // Get current user
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
}

export { customAuth };