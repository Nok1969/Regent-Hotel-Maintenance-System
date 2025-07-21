import type { Express } from "express";
import { body, query, validationResult } from "express-validator";
import { getAllUsers, searchUsers, updateUser, createUser } from "../storage";

export function userRoutes(
  app: Express,
  { requireAuth, requirePermission }: { requireAuth: any; requirePermission: (permission: string) => any }
) {
  // Get all users
  app.get("/api/users", [
    requireAuth,
    requirePermission("users:read"),
    query("search").optional().isString(),
  ], async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const searchQuery = req.query.search as string;
      
      let users;
      if (searchQuery) {
        users = await searchUsers(searchQuery);
      } else {
        users = await getAllUsers();
      }

      // Remove password from response
      const sanitizedUsers = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });

      res.json(sanitizedUsers);
    } catch (error) {
      console.error("Get users error:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Update user role
  app.patch("/api/users/:id/role", [
    requireAuth,
    requirePermission("users:update"),
    body("role").isIn(["admin", "manager", "staff", "technician"]),
  ], async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      const { role } = req.body;

      const user = await updateUser(id, { role });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Update user role error:", error);
      res.status(500).json({ message: "Failed to update user role" });
    }
  });

  // Create new user (admin only)
  app.post("/api/users", [
    requireAuth,
    requirePermission("users:create"),
    body("email").isEmail().normalizeEmail(),
    body("firstName").isString().isLength({ min: 1, max: 100 }),
    body("lastName").isString().isLength({ min: 1, max: 100 }),
    body("role").isIn(["admin", "manager", "staff", "technician"]),
    body("language").optional().isIn(["en", "th"]),
    body("password").optional().isString().isLength({ min: 8 }),
  ], async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const userData = {
        ...req.body,
        language: req.body.language || "en",
      };

      const user = await createUser(userData);

      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error("Create user error:", error);
      if (error.message?.includes("duplicate key")) {
        return res.status(409).json({ message: "Email already exists" });
      }
      res.status(500).json({ message: "Failed to create user" });
    }
  });
}