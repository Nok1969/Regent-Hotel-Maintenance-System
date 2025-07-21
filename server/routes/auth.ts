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
        "tech": { id: "tech-123", role: "technician", password: "tech123" }
      };

      const mockUser = mockUsers[username as keyof typeof mockUsers];
      
      if (!mockUser) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Simple password check for demo
      if (mockUser.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Get user from database
      const user = await storage.getUser(mockUser.id);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      // Store user info in session
      req.session.mockUser = {
        id: user.id,
        role: user.role,
        isAuthenticated: true,
        timestamp: Date.now()
      };

      console.log('Login successful for user:', user.id);

      res.json({ 
        success: true, 
        role: user.role,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
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

  // Get current user - Fixed for better session management
  app.get("/api/auth/user", asyncHandler(async (req: any, res: any) => {
    // Check for session-based authentication first (prioritize mock auth for development)
    if (req.session?.mockUser?.isAuthenticated) {
      const userId = req.session.mockUser.id;
      try {
        const user = await storage.getUser(userId);
        if (user) {
          const permissions = getUserPermissions(user.role as any);
          return res.json({ ...user, permissions });
        }
      } catch (error) {
        console.error('Error fetching user from storage:', error);
        // Clear invalid session
        req.session.mockUser = null;
      }
    }

    // Then check Replit auth
    if (req.isAuthenticated && req.isAuthenticated() && req.user?.claims?.sub) {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (user) {
        const permissions = getUserPermissions(user.role as any);
        return res.json({ ...user, permissions });
      } else {
        return res.status(404).json({ message: "User not found" });
      }
    }
    
    // If no authentication found
    return res.status(401).json({ message: "Unauthorized" });
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