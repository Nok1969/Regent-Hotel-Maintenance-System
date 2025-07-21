import express from "express";
import session from "express-session";
import ConnectPgSimple from "connect-pg-simple";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { body, validationResult } from "express-validator";
import path from "path";
import { fileURLToPath } from "url";

import { pool } from "./db";
import { registerRoutes } from "./routes";
import { getUser, getUserByEmail, createUser } from "./storage";
import { checkPermission } from "./permissions";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 5000;

// Trust proxy for Replit
app.set("trust proxy", 1);

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === "production" 
    ? [process.env.REPL_SLUG ? `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co` : false].filter(Boolean)
    : ["http://localhost:5000", "http://127.0.0.1:5000"],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// Security middleware
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === "production" ? {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "wss:", "https:"],
    },
  } : false,
}));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: "Too many requests from this IP, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: { error: "Too many authentication attempts, please try again later." },
});

const uploadLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 uploads per minute
  message: { error: "Too many upload attempts, please try again later." },
});

// Apply rate limiting
app.use("/api", apiLimiter);
app.use("/api/auth", authLimiter);
app.use("/api/uploads", uploadLimiter);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// Session configuration
const PgSession = ConnectPgSimple(session);

app.use(
  session({
    store: new PgSession({
      pool: pool,
      tableName: "user_sessions",
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET || "your-secret-key-here",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    },
  })
);

// Input sanitization middleware
const sanitizeInput = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const sanitize = (obj: any): any => {
    if (typeof obj === "string") {
      return obj.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
    }
    if (Array.isArray(obj)) {
      return obj.map(sanitize);
    }
    if (obj && typeof obj === "object") {
      const sanitized: any = {};
      for (const key in obj) {
        sanitized[key] = sanitize(obj[key]);
      }
      return sanitized;
    }
    return obj;
  };

  req.body = sanitize(req.body);
  req.query = sanitize(req.query);
  next();
};

app.use(sanitizeInput);

// Request logging in development
if (process.env.NODE_ENV === "development") {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
    next();
  });
}

// Static file serving
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Serve React app in production
if (process.env.NODE_ENV === "production") {
  const publicPath = path.join(__dirname, "public");
  app.use(express.static(publicPath));
}

// Authentication middleware
const requireAuth = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await getUser(parseInt(userId));
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Permission middleware
const requirePermission = (permission: string) => {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!checkPermission(req.user.role, permission)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    next();
  };
};

// Mock login endpoint for development
app.post("/api/auth/mock-login", [
  body("email").isEmail().normalizeEmail(),
  body("role").isIn(["admin", "manager", "staff", "technician"]),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, role, firstName, lastName } = req.body;

    // Check if user exists
    let user = await getUserByEmail(email);
    
    if (!user) {
      // Create mock user
      user = await createUser({
        email,
        firstName: firstName || "Mock",
        lastName: lastName || "User",
        role: role || "staff",
        language: "en",
      });
    }

    req.session.userId = user.id.toString();
    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        return res.status(500).json({ message: "Session error" });
      }
      res.json(user);
    });
  } catch (error) {
    console.error("Mock login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Mock logout endpoint
app.post("/api/auth/mock-logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Session destroy error:", err);
      return res.status(500).json({ message: "Logout failed" });
    }
    res.clearCookie("connect.sid");
    res.json({ message: "Logged out successfully" });
  });
});

// Register API routes
registerRoutes(app, { requireAuth, requirePermission });

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Global error:", err);
  
  if (process.env.NODE_ENV === "production") {
    res.status(500).json({ message: "Internal server error" });
  } else {
    res.status(500).json({ 
      message: err.message,
      stack: err.stack,
    });
  }
});

// Handle React routes in production
if (process.env.NODE_ENV === "production") {
  app.get("*", (req, res) => {
    const publicPath = path.join(__dirname, "public");
    res.sendFile(path.join(publicPath, "index.html"));
  });
}

// 404 handler for API routes
app.use("/api/*", (req, res) => {
  res.status(404).json({ message: "API endpoint not found" });
});

// Start server
const server = app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${port}`);
  if (process.env.NODE_ENV === "development") {
    console.log(`Frontend: http://localhost:${port}`);
    console.log(`Backend API: http://localhost:${port}/api`);
  }
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received");
  server.close((err) => {
    console.log("HTTP server closed");
    pool.end(() => {
      console.log("Database pool closed");
      process.exit(err ? 1 : 0);
    });
  });
});

export default app;