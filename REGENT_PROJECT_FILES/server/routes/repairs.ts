import type { Express } from "express";
import { body, query, validationResult } from "express-validator";
import { 
  createRepair, 
  getAllRepairs, 
  getRepair, 
  updateRepair,
  getRepairStats,
  getRepairsByCategory,
  getRepairsByUrgency,
  getMonthlyRepairStats
} from "../storage";
import { createNotification } from "../storage";

export function repairRoutes(
  app: Express,
  { requireAuth, requirePermission }: { requireAuth: any; requirePermission: (permission: string) => any }
) {
  // Get all repairs with filtering and pagination
  app.get("/api/repairs", [
    requireAuth,
    requirePermission("repairs:read"),
    query("limit").optional().isInt({ min: 1, max: 100 }),
    query("offset").optional().isInt({ min: 0 }),
    query("status").optional().isIn(["all", "pending", "inProgress", "completed"]),
    query("category").optional().isIn(["all", "electrical", "plumbing", "airconditioning", "furniture", "other"]),
    query("search").optional().isString(),
  ], async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const status = req.query.status as string;
      const category = req.query.category as string;
      const search = req.query.search as string;

      const result = await getAllRepairs(limit, offset, status, category, search);
      res.json(result);
    } catch (error) {
      console.error("Get repairs error:", error);
      res.status(500).json({ message: "Failed to fetch repairs" });
    }
  });

  // Get single repair
  app.get("/api/repairs/:id", [
    requireAuth,
    requirePermission("repairs:read"),
  ], async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid repair ID" });
      }

      const repair = await getRepair(id);
      if (!repair) {
        return res.status(404).json({ message: "Repair not found" });
      }

      res.json(repair);
    } catch (error) {
      console.error("Get repair error:", error);
      res.status(500).json({ message: "Failed to fetch repair" });
    }
  });

  // Create new repair
  app.post("/api/repairs", [
    requireAuth,
    requirePermission("repairs:create"),
    body("room").isString().isLength({ min: 1, max: 10 }),
    body("category").isIn(["electrical", "plumbing", "airconditioning", "furniture", "other"]),
    body("urgency").isIn(["low", "medium", "high"]),
    body("description").isString().isLength({ min: 10, max: 1000 }),
    body("images").optional().isArray(),
  ], async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const repairData = {
        ...req.body,
        userId: req.user.id,
        status: "pending" as const,
      };

      const repair = await createRepair(repairData);

      // Create notification for managers and admins
      await createNotification({
        userId: "system",
        title: "New Repair Request",
        message: `New repair request for ${repair.room}: ${repair.description.substring(0, 100)}...`,
        type: "info",
        data: { repairId: repair.id },
      });

      res.status(201).json(repair);
    } catch (error) {
      console.error("Create repair error:", error);
      res.status(500).json({ message: "Failed to create repair" });
    }
  });

  // Update repair
  app.patch("/api/repairs/:id", [
    requireAuth,
    requirePermission("repairs:update"),
    body("status").optional().isIn(["pending", "inProgress", "completed"]),
    body("technicianId").optional().isInt(),
    body("notes").optional().isString(),
    body("estimatedCompletion").optional().isISO8601(),
    body("actualCompletion").optional().isISO8601(),
  ], async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid repair ID" });
      }

      const existingRepair = await getRepair(id);
      if (!existingRepair) {
        return res.status(404).json({ message: "Repair not found" });
      }

      const repair = await updateRepair(id, req.body);
      if (!repair) {
        return res.status(500).json({ message: "Failed to update repair" });
      }

      // Create notification for status updates
      if (req.body.status && req.body.status !== existingRepair.status) {
        await createNotification({
          userId: existingRepair.userId?.toString() || "system",
          title: "Repair Status Updated",
          message: `Repair for ${repair.room} status changed to ${req.body.status}`,
          type: "info",
          data: { repairId: repair.id },
        });
      }

      res.json(repair);
    } catch (error) {
      console.error("Update repair error:", error);
      res.status(500).json({ message: "Failed to update repair" });
    }
  });

  // Accept repair job (for technicians)
  app.post("/api/repairs/:id/accept", [
    requireAuth,
    requirePermission("repairs:assign"),
  ], async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid repair ID" });
      }

      const repair = await updateRepair(id, {
        technicianId: req.user.id,
        status: "inProgress",
      });

      if (!repair) {
        return res.status(404).json({ message: "Repair not found" });
      }

      // Create notification
      await createNotification({
        userId: repair.userId?.toString() || "system",
        title: "Repair Job Accepted",
        message: `${req.user.firstName} ${req.user.lastName} has accepted your repair request for ${repair.room}`,
        type: "success",
        data: { repairId: repair.id, technicianId: req.user.id },
      });

      res.json(repair);
    } catch (error) {
      console.error("Accept repair error:", error);
      res.status(500).json({ message: "Failed to accept repair" });
    }
  });

  // Cancel repair job (for technicians)
  app.post("/api/repairs/:id/cancel", [
    requireAuth,
    requirePermission("repairs:assign"),
  ], async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid repair ID" });
      }

      const repair = await updateRepair(id, {
        technicianId: null,
        status: "pending",
      });

      if (!repair) {
        return res.status(404).json({ message: "Repair not found" });
      }

      // Create notification
      await createNotification({
        userId: repair.userId?.toString() || "system",
        title: "Repair Job Cancelled",
        message: `Repair request for ${repair.room} has been cancelled and is available for assignment`,
        type: "warning",
        data: { repairId: repair.id },
      });

      res.json(repair);
    } catch (error) {
      console.error("Cancel repair error:", error);
      res.status(500).json({ message: "Failed to cancel repair" });
    }
  });

  // Get repair statistics
  app.get("/api/stats/summary", [
    requireAuth,
    requirePermission("dashboard:view"),
  ], async (req, res) => {
    try {
      const stats = await getRepairStats();
      res.json(stats);
    } catch (error) {
      console.error("Get stats error:", error);
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  // Get repairs by category
  app.get("/api/stats/category", [
    requireAuth,
    requirePermission("dashboard:view"),
  ], async (req, res) => {
    try {
      const stats = await getRepairsByCategory();
      res.json(stats);
    } catch (error) {
      console.error("Get category stats error:", error);
      res.status(500).json({ message: "Failed to fetch category statistics" });
    }
  });

  // Get repairs by urgency
  app.get("/api/stats/urgency", [
    requireAuth,
    requirePermission("dashboard:view"),
  ], async (req, res) => {
    try {
      const stats = await getRepairsByUrgency();
      res.json(stats);
    } catch (error) {
      console.error("Get urgency stats error:", error);
      res.status(500).json({ message: "Failed to fetch urgency statistics" });
    }
  });

  // Get monthly repair statistics
  app.get("/api/stats/monthly", [
    requireAuth,
    requirePermission("dashboard:view"),
  ], async (req, res) => {
    try {
      const stats = await getMonthlyRepairStats();
      res.json(stats);
    } catch (error) {
      console.error("Get monthly stats error:", error);
      res.status(500).json({ message: "Failed to fetch monthly statistics" });
    }
  });
}