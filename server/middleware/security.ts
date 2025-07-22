import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { body, param, query, validationResult } from "express-validator";
import type { Request, Response, NextFunction } from "express";

// Rate limiting configuration
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Stricter rate limiting for auth endpoints
export const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes (reduced from 15)
  max: 10, // increased from 5 to 10 attempts per window
  message: {
    error: "Too many authentication attempts, please try again later."
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting for localhost in development
  skip: (req: Request) => process.env.NODE_ENV === 'development' && req.ip === '127.0.0.1'
});

// Upload rate limiting
export const uploadLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 uploads per minute
  message: {
    error: "Too many upload attempts, please try again later.",
  },
});

// Helmet security configuration
export const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "blob:", "https:"],
      scriptSrc: process.env.NODE_ENV === "development" 
        ? ["'self'", "'unsafe-eval'", "'unsafe-inline'"] 
        : ["'self'"],
      connectSrc: ["'self'", "ws:", "wss:"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: process.env.NODE_ENV === "production" ? [] : null,
    },
  },
  crossOriginEmbedderPolicy: false, // Disable for chart.js compatibility
});

// Validation schemas
export const repairValidation = [
  body("room")
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Room number is required and must be less than 100 characters")
    .escape(), // XSS protection

  body("category")
    .isIn(["electrical", "plumbing", "air_conditioning", "furniture", "other"])
    .withMessage("Invalid category"),

  body("urgency")
    .isIn(["low", "medium", "high"])
    .withMessage("Invalid urgency level"),

  body("description")
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage("Description must be between 10 and 1000 characters")
    .escape(), // XSS protection
];

export const updateRepairValidation = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("Invalid repair ID"),

  body("status")
    .optional()
    .isIn(["pending", "in_progress", "completed"])
    .withMessage("Invalid status"),

  body("room")
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Room number must be less than 100 characters")
    .escape(),

  body("description")
    .optional()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage("Description must be between 10 and 1000 characters")
    .escape(),
];

export const queryValidation = [
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100")
    .toInt(),

  query("offset")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Offset must be a non-negative integer")
    .toInt(),

  query("search")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Search term must be less than 100 characters")
    .escape(),
];

export const userValidation = [
  param("id")
    .isLength({ min: 1 })
    .withMessage("Invalid user ID")
    .escape(),

  body("role")
    .optional()
    .isIn(["admin", "manager", "staff", "technician"])
    .withMessage("Invalid role"),

  body("language")
    .optional()
    .isIn(["en", "th"])
    .withMessage("Invalid language"),
];

// Validation error handler
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: "Validation failed",
      details: errors.array().map(err => ({
        field: 'param' in err ? err.param : 'unknown',
        message: err.msg,
        value: 'value' in err ? err.value : 'unknown',
      })),
    });
  }
  next();
};

// Async error wrapper for route handlers
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Global error handler
export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("Global error:", err);

  // Validation errors
  if (err.name === "ValidationError") {
    return res.status(400).json({
      error: "Validation failed",
      message: err.message,
    });
  }

  // Database errors
  if (err.code === "ECONNREFUSED" || err.code === "ENOTFOUND") {
    return res.status(503).json({
      error: "Database connection failed",
      message: process.env.NODE_ENV === "development" ? err.message : "Service temporarily unavailable",
    });
  }

  // JWT/Auth errors
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    return res.status(401).json({
      error: "Authentication failed",
      message: "Invalid or expired token",
    });
  }

  // File upload errors
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({
      error: "File too large",
      message: "File size exceeds the maximum allowed limit",
    });
  }

  if (err.code === "LIMIT_UNEXPECTED_FILE") {
    return res.status(400).json({
      error: "Invalid file upload",
      message: "Unexpected file field or too many files",
    });
  }

  // Default error response
  const statusCode = err.statusCode || err.status || 500;
  res.status(statusCode).json({
    error: statusCode >= 500 ? "Internal server error" : "Bad request",
    message: process.env.NODE_ENV === "development" ? err.message : "Something went wrong",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

// CORS configuration
export const corsOptions = {
  origin: process.env.NODE_ENV === "production" 
    ? process.env.ALLOWED_ORIGINS?.split(",") || []
    : ["http://localhost:3000", "http://localhost:5000", "http://127.0.0.1:5000"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept", "Origin", "X-Requested-With"],
  exposedHeaders: ["RateLimit-Limit", "RateLimit-Remaining", "RateLimit-Reset"],
};

// Input sanitization middleware for non-JSON bodies
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  // Sanitize URL parameters
  for (const key in req.params) {
    if (typeof req.params[key] === "string") {
      req.params[key] = req.params[key].replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
    }
  }

  // Sanitize query parameters
  for (const key in req.query) {
    if (typeof req.query[key] === "string") {
      req.query[key] = (req.query[key] as string).replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
    }
  }

  next();
};

// CSRF Protection middleware
export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
  // Skip CSRF for GET requests and auth endpoints
  if (req.method === 'GET' || req.path.startsWith('/api/auth')) {
    return next();
  }

  // Check for CSRF token in header
  const csrfToken = req.headers['x-csrf-token'] as string;
  const sessionToken = (req.session as any)?.csrfToken;

  if (!csrfToken || !sessionToken || csrfToken !== sessionToken) {
    return res.status(403).json({
      error: "CSRF token validation failed",
      message: "Invalid or missing CSRF token",
    });
  }

  next();
};

// Generate CSRF token
export const generateCSRFToken = () => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};