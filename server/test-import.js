// Test script to check if server can be imported and started
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log("Testing server startup...");
console.log("Current directory:", process.cwd());
console.log("Script directory:", __dirname);

try {
  console.log("Attempting to import server...");
  await import("./server.js");
  console.log("✅ Server imported successfully!");
} catch (error) {
  console.error("❌ Error importing server:", error.message);
  console.error("Stack:", error.stack);
}
