import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import registerRoutes from "./routes/index";
import { setupVite, serveStatic, log } from "./vite";
import { 
  apiLimiter, 
  authLimiter, 
  helmetConfig, 
  corsOptions, 
  sanitizeInput,
  globalErrorHandler 
} from "./middleware/security";

const app = express();

// Enhanced security middleware
app.use(helmetConfig);

// CORS configuration with environment-specific origins
app.use(cors(corsOptions));

// Input sanitization for XSS protection
app.use(sanitizeInput);

// Global API rate limiting
app.use('/api', apiLimiter);

// Specific rate limits for auth endpoints
app.use('/api/auth', authLimiter);
app.use('/api/login', authLimiter);
app.use('/api/logout', authLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    // Test database connection before starting server
    const { testDatabaseConnection } = await import("./db.js");
    const dbConnected = await testDatabaseConnection();
    
    if (!dbConnected) {
      console.warn('Database connection test failed, but continuing with server startup...');
    }

    const server = await registerRoutes(app);

    // Serve static files from client/public (images, etc.)
    app.use('/images', express.static('client/public/images'));
    app.use('/uploads', express.static('uploads')); // Keep existing uploads folder

    // Enhanced global error handler
    app.use(globalErrorHandler);

    // 404 handler for API routes
    app.use('/api/*', (req: Request, res: Response) => {
      res.status(404).json({
        error: "Not Found",
        message: `API endpoint ${req.method} ${req.path} not found`,
      });
    });

    if (process.env.NODE_ENV === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    const PORT = Number(process.env.PORT) || 5000;
    server.listen(PORT, "0.0.0.0", () => {
      const url = `http://localhost:${PORT}`;
      console.log(`Server running on ${url}`);

      if (process.env.NODE_ENV === "development") {
        console.log(`Frontend: ${url}`);
        console.log(`Backend API: ${url}/api`);
      }
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
})();