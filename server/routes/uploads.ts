import type { Express } from "express";
import { customAuth } from "./auth";
import { asyncHandler } from "../middleware/security";
import multer from "multer";
import path from "path";
import fs from "fs";

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
      return cb(error as any, false);
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

export function setupUploadRoutes(app: Express) {
  // File upload endpoint
  app.post("/api/upload", 
    customAuth,
    upload.array('files', 5),
    handleUploadError,
    asyncHandler(async (req: any, res: any) => {
      const files = req.files as Express.Multer.File[];
      
      if (!files || files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
      }

      const fileUrls = files.map((file) => ({
        originalName: file.originalname,
        filename: file.filename,
        url: `/uploads/${file.filename}`,
        size: file.size,
        mimetype: file.mimetype
      }));

      res.json({ 
        message: "Files uploaded successfully",
        files: fileUrls 
      });
    })
  );
}