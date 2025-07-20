import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Configure Neon WebSocket
neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Add connection pool configuration with proper error handling
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Handle pool errors gracefully
pool.on('error', (err) => {
  console.error('Database pool error:', err.message);
  // Don't crash the application, just log the error
});

export const db = drizzle({ client: pool, schema });

// Test database connection with retry logic
export async function testDatabaseConnection() {
  let retryCount = 0;
  const maxRetries = 3;
  
  while (retryCount < maxRetries) {
    try {
      const client = await pool.connect();
      await client.query('SELECT 1');
      client.release();
      console.log('Database connection successful');
      return true;
    } catch (error) {
      retryCount++;
      console.warn(`Database connection attempt ${retryCount} failed:`, error instanceof Error ? error.message : 'Unknown error');
      
      if (retryCount >= maxRetries) {
        console.error('Database connection failed after', maxRetries, 'attempts');
        return false;
      }
      
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
    }
  }
  
  return false;
}