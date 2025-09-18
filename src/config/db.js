import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../db/schema.js";
import { DATABASE_URI } from "./env.js";

// Create Neon connection with extended timeout and retry configuration
const sql = neon(DATABASE_URI, {
  // Add connection options for better reliability
  fetchConnectionCache: true,
  // Increase timeout for slow connections
  fetchOptions: {
    timeout: 30000, // 30 seconds timeout
  },
});

// Test connection with retry logic
async function testConnection(retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`Testing database connection... (attempt ${i + 1}/${retries})`);
      await sql`SELECT 1`;
      console.log('✅ Database connection successful');
      return true;
    } catch (error) {
      console.error(`❌ Database connection failed (attempt ${i + 1}):`, error.message);
      
      if (i === retries - 1) {
        console.error('🚨 All connection attempts failed. Running in offline mode.');
        console.error('Please check:');
        console.error('1. Your internet connection');
        console.error('2. Windows Firewall settings');
        console.error('3. Antivirus software blocking connections');
        console.error('4. Your Neon database status');
        return false;
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  return false;
}

// Test connection when module loads (non-blocking)
testConnection().catch(console.error);

export const db = drizzle(sql, { schema });
