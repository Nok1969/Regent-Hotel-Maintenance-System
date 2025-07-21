import type { Express } from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../uploads"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 5, // Maximum 5 files
  },
  fileFilter: (req, file, cb) => {
    // Only allow image files
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

export function uploadRoutes(
  app: Express,
  { requireAuth, requirePermission }: { requireAuth: any; requirePermission: (permission: string) => any }
) {
  // Upload repair images
  app.post("/api/uploads/repair-images", [
    requireAuth,
    requirePermission("uploads:create"),
    upload.array("images", 5),
  ], async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
      }

      const files = req.files as Express.Multer.File[];
      const filePaths = files.map(file => `/uploads/${file.filename}`);

      res.json({
        message: "Files uploaded successfully",
        files: filePaths,
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ message: "Failed to upload files" });
    }
  });

  // Error handler for multer
  app.use((error: any, req: any, res: any, next: any) => {
    if (error instanceof multer.MulterError) {
      if (error.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ message: "File size too large. Maximum 5MB allowed." });
      }
      if (error.code === "LIMIT_FILE_COUNT") {
        return res.status(400).json({ message: "Too many files. Maximum 5 files allowed." });
      }
    }
    if (error.message === "Only image files are allowed") {
      return res.status(400).json({ message: "Only image files are allowed" });
    }
    next(error);
  });
}