import { ConvexHttpClient } from "convex/browser";
import { fileURLToPath } from "url";
import { dirname, join, resolve } from "path";
import * as dotenv from "dotenv";

// Load environment variables from dedalus-mcp folder only
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Only load from dedalus-mcp/.env.local (not parent directory)
dotenv.config({ path: join(__dirname, "../.env.local") });

// Import Convex API types - use dynamic import with string to avoid TypeScript compilation
let api: any = null;

async function loadApi() {
  if (!api) {
    // Resolve to absolute path first
    // From dist/lib/convexClient.js: dist/lib -> dist -> dedalus-mcp -> monorepo root
    const relativePath = join(__dirname, "../../../convex/_generated/api.js");
    const absolutePath = resolve(relativePath);
    // Convert to file:// URL for ES module import (ensure forward slashes)
    const apiPath = `file://${absolutePath}`.replace(/\\/g, "/");

    // Use dynamic import with file path to avoid TypeScript checking convex folder
    try {
      const apiModule = await import(apiPath);
      api = apiModule.api;
    } catch (error) {
      console.error(`Failed to load Convex API from ${apiPath}:`, error);
      throw error;
    }
  }
  return api;
}

let convexClient: ConvexHttpClient | null = null;

/**
 * Get or create the Convex HTTP client
 * @returns {ConvexHttpClient} Convex client instance
 * @throws {Error} If CONVEX_URL is not set
 */
export function getConvexClient(): ConvexHttpClient {
  if (convexClient) {
    return convexClient;
  }

  // Check environment variable first, then .env.local
  const convexUrl = process.env.CONVEX_URL;
  if (!convexUrl) {
    throw new Error(
      "CONVEX_URL environment variable is not set. " +
        "Please set it in dedalus-mcp/.env.local or as an environment variable. " +
        "You can copy CONVEX_URL from the monorepo root .env.local file."
    );
  }

  convexClient = new ConvexHttpClient(convexUrl);
  return convexClient;
}

/**
 * Get the Convex API reference
 * @returns {Promise<any>} Convex API reference
 */
export async function getConvexApi() {
  return await loadApi();
}
