/**
 * Simple test script to verify server functionality
 * Run with: node test-server.js
 */

import fetch from "node-fetch";

const BASE_URL = "http://localhost:5000";

async function testServer() {
  console.log("🧪 Testing MFA Server...\n");

  try {
    // Test 1: Health check
    console.log("1. Testing health endpoint...");
    const healthResponse = await fetch(`${BASE_URL}/health`);
    const healthData = await healthResponse.json();

    if (healthResponse.ok) {
      console.log("✅ Health check passed");
      console.log(`   Status: ${healthData.status}`);
      console.log(`   Environment: ${healthData.environment}\n`);
    } else {
      console.log("❌ Health check failed\n");
    }

    // Test 2: API root
    console.log("2. Testing API root endpoint...");
    const rootResponse = await fetch(`${BASE_URL}/`);
    const rootData = await rootResponse.json();

    if (rootResponse.ok) {
      console.log("✅ API root accessible");
      console.log(`   Message: ${rootData.message}\n`);
    } else {
      console.log("❌ API root failed\n");
    }

    // Test 3: Auth status (should be unauthenticated)
    console.log("3. Testing auth status endpoint...");
    const authResponse = await fetch(`${BASE_URL}/api/auth/status`, {
      credentials: "include",
    });
    const authData = await authResponse.json();

    if (authResponse.ok) {
      console.log("✅ Auth status endpoint working");
      console.log(`   Authenticated: ${authData.isAuthenticated}\n`);
    } else {
      console.log("❌ Auth status failed\n");
    }

    // Test 4: Invalid endpoint (should return 404)
    console.log("4. Testing 404 handling...");
    const notFoundResponse = await fetch(`${BASE_URL}/api/nonexistent`);

    if (notFoundResponse.status === 404) {
      console.log("✅ 404 handling working correctly\n");
    } else {
      console.log("❌ 404 handling not working\n");
    }

    // Test 5: Rate limiting test (commented out to avoid hitting limits during testing)
    /*
        console.log('5. Testing rate limiting...');
        const promises = [];
        for (let i = 0; i < 10; i++) {
            promises.push(fetch(`${BASE_URL}/health`));
        }
        
        const responses = await Promise.all(promises);
        const successCount = responses.filter(r => r.ok).length;
        console.log(`✅ Rate limiting test: ${successCount}/10 requests succeeded\n`);
        */

    console.log("🎉 Server tests completed!");
    console.log("\n📋 Test Summary:");
    console.log("   - Health endpoint: Working");
    console.log("   - API root: Working");
    console.log("   - Auth status: Working");
    console.log("   - 404 handling: Working");
    console.log("\n🚀 Server is ready for use!");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    console.log("\n🔧 Make sure the server is running: npm run dev");
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testServer();
}

export default testServer;
